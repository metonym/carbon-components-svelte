<script>
  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the kind of notification.
     * @type {"error" | "info" | "info-square" | "success" | "warning" | "warning-alt"}
     */
    kind = "error",

    /** Set to `true` to use the low contrast variant */
    lowContrast = false,

    /**
     * Set the timeout duration (ms) to hide the notification after opening it.
     * Ignored when the notification is `actionable` or has `actions`.
     */
    timeout = 0,

    /** Set to `true` to pause the auto-dismiss timeout while the pointer is over the notification or while focus is inside it. */
    pauseOnHover = false,

    /**
     * Specify the ARIA `role` for the notification container.
     * `actionable` overrides it with `alertdialog`.
     * @type {"alert" | "log" | "status"}
     */
    role = "status",

    /**
     * Set to `true` when the notification holds an action that users must
     * reach, such as an undo or a retry. The notification becomes an
     * `alertdialog` named by its title, moves focus to its first action
     * (or the close button) when it opens, keeps Tab inside, and closes
     * on Escape.
     */
    actionable = false,

    /**
     * Set to `false` to keep focus where it is when an actionable
     * notification opens. Has no effect unless `actionable` is `true`.
     */
    focusOnOpen = true,

    /**
     * Set to `false` to keep an actionable notification open on Escape.
     * With `hideCloseButton` also set, Tab can leave the notification.
     * Has no effect unless `actionable` is `true`.
     */
    closeOnEscape = true,

    /**
     * Specify the title text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    titleText = "",

    /**
     * Specify the subtitle text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    subtitleText = "",

    /**
     * Specify the caption text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    captionText = "",

    /** Set to `true` to hide the close button */
    hideCloseButton = false,

    /** Specify the ARIA label for the close button */
    closeButtonDescription = "Close notification",

    /**
     * Specify the label of the status icon for screen readers.
     * Defaults to the kind, such as "Warning".
     * @type {string | undefined}
     */
    statusIconDescription = undefined,

    /**
     * Set to `true` for the notification to span
     * the full width of its containing element.
     */
    fullWidth = false,

    /** Set to `true` to show the notification, `false` to hide it. */
    open = $bindable(true),

    /**
     * Set an id for the top-level element. The title and subtitle ids derive
     * from it as `{id}-title` and `{id}-subtitle`, so the server and the
     * browser render the same ids.
     * @type {string | undefined}
     */
    id = undefined,

    /**
     * Called when the user closes the notification: the close button
     * (`"close-button"`), Escape on an actionable notification
     * (`"escape-key"`), or the auto-dismiss `timeout` (`"timeout"`). Call
     * `preventDefault()` to keep it open. Not called when `open` is set from
     * outside.
     * @type {((detail: import("../utils/cancelable.js").Cancelable<{ open: boolean; trigger: "close-button" | "escape-key" | "timeout" }>) => void) | undefined}
     */
    onopenchange = undefined,

    /**
     * Extra content under the caption.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * Actions, such as a `NotificationActionButton`. A notification with
     * actions ignores `timeout`.
     * @type {import("svelte").Snippet | undefined}
     */
    actions = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-labelledby": ariaLabelledBy = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLDivElement> | undefined | null} */
    onmouseenter = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLDivElement> | undefined | null} */
    onmouseleave = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLDivElement> | undefined | null} */
    onfocusin = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLDivElement> | undefined | null} */
    onfocusout = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLDivElement> | undefined | null} */
    onkeydown = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import { on } from "svelte/events";
  import { cancelable } from "../utils/cancelable.js";
  import { createDismissibleNotification } from "../utils/dismissible-notification.js";
  import { joinDescribedBy } from "../utils/field-status.js";
  import NotificationButton from "./NotificationButton.svelte";
  import NotificationIcon from "./NotificationIcon.svelte";
  import {
    getNotificationQueue,
    hasNotificationQueue,
    setNotificationAction,
  } from "./notification-context.js";
  import { kindClasses } from "./notification-kind-classes.js";
  import { statusIconLabel } from "./status-icon-label.js";

  // `kind` with its declared type, which the type checker reads from the
  // default value alone.
  const notificationKind = $derived(
    /** @type {import("./notification-kind-classes.js").NotificationKind} */ (
      kind
    ),
  );

  const titleId = $derived(`${id ?? fallbackId}-title`);
  const subtitleId = $derived(`${id ?? fallbackId}-subtitle`);

  /** @type {null | HTMLDivElement} */
  let notificationRef = $state(null);

  const hasTitle = $derived(Boolean(titleText));
  const hasSubtitle = $derived(Boolean(subtitleText));
  // As in Carbon React, the title names the dialog, or the subtitle when
  // there is no title. aria-labelledby beats aria-label, so a consumer
  // aria-label drops the built-in id.
  const labelId = $derived(
    hasTitle ? titleId : hasSubtitle ? subtitleId : undefined,
  );
  const builtInLabelledBy = $derived(
    actionable && !ariaLabel ? labelId : undefined,
  );
  const builtInDescribedBy = $derived(
    actionable && hasTitle && hasSubtitle ? subtitleId : undefined,
  );

  // The title describes an action, as in a Callout. An actionable
  // notification is a dialog named by its title, so the action skips it.
  setNotificationAction({
    get describedBy() {
      return titleText && !actionable ? titleId : undefined;
    },
    toast: true,
  });

  // A `NotificationQueue` holds every toast's timer while the pointer or
  // focus is inside the queue.
  const queue = hasNotificationQueue() ? getNotificationQueue() : undefined;

  const notification = createDismissibleNotification({
    requestClose: (trigger) => {
      const payload = cancelable({ open: false, trigger });
      onopenchange?.(payload);
      return !payload.defaultPrevented;
    },
    getPauseOnHover: () => pauseOnHover,
    setOpen: (value) => {
      open = value;
    },
    getRef: () => notificationRef,
  });

  // Through `$derived`, so a parent that re-spreads the same values, as a
  // `NotificationQueue` does on `update()`, doesn't restart the timer.
  const timerTimeout = $derived(timeout);
  const hasAction = $derived(actionable || actions !== undefined);
  const focusesOnOpen = $derived(actionable && focusOnOpen);
  $effect(() => {
    const args = /** @type {const} */ ([open, timerTimeout, hasAction]);
    // `sync` reads other props, such as `pauseOnHover`; only these restart it.
    untrack(() => notification.sync(...args));
  });
  $effect(() => {
    const args = /** @type {const} */ ([open, focusesOnOpen]);
    untrack(() => notification.syncFocusOnOpen(...args));
  });

  $effect(() => {
    notification.setPaused(Boolean(queue?.paused));
  });

  onMount(() => notification.dispose);

  /**
   * A listener on the element, not a delegated `onkeydown`, so Escape can
   * stop before a surrounding modal's own listener sees it.
   * @param {HTMLDivElement} node
   */
  function keydownListener(node) {
    return on(node, "keydown", (event) => {
      onkeydown?.(/** @type {any} */ (event));
      if (actionable) {
        notification.handleActionableKeydown(event, {
          closeOnEscape,
          hideCloseButton,
        });
      }
    });
  }
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

{#if open}
  <!-- An actionable notification takes focus itself when it holds no button. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    bind:this={notificationRef}
    role={actionable ? "alertdialog" : role}
    tabindex={actionable ? -1 : undefined}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy ?? builtInLabelledBy}
    aria-describedby={joinDescribedBy(builtInDescribedBy, ariaDescribedBy)}
    {id}
    {...rest}
    class={[
      "bx--toast-notification",
      lowContrast
        ? "bx--toast-notification--low-contrast"
        : "bx--toast-notification--high-contrast",
      ...kindClasses("toast", notificationKind, lowContrast),
      className,
    ]}
    style:width={fullWidth ? "100%" : undefined}
    onmouseenter={(event) => {
      onmouseenter?.(event);
      notification.handleMouseenter();
    }}
    onmouseleave={(event) => {
      onmouseleave?.(event);
      notification.handleMouseleave(event);
    }}
    onfocusin={(event) => {
      onfocusin?.(event);
      notification.handleFocusIn(event);
    }}
    onfocusout={(event) => {
      onfocusout?.(event);
      notification.handleFocusOut(event);
    }}
    {@attach keydownListener}
  >
    <NotificationIcon
      kind={notificationKind}
      {lowContrast}
      iconDescription={statusIconDescription ||
        statusIconLabel(notificationKind)}
    />
    <div class="bx--toast-notification__details">
      {#if hasTitle}
        <h3 id={titleId} class="bx--toast-notification__title">
          {@render content(titleText)}
        </h3>
      {/if}
      {#if hasSubtitle}
        <div
          id={actionable ? subtitleId : undefined}
          class="bx--toast-notification__subtitle"
        >
          {@render content(subtitleText)}
        </div>
      {/if}
      {#if captionText}
        <div class="bx--toast-notification__caption">
          {@render content(captionText)}
        </div>
      {/if}
      {@render children?.()}
      {#if actions}
        <div class="bx--toast-notification__actions">
          {@render actions()}
        </div>
      {/if}
    </div>
    {#if !hideCloseButton}
      <NotificationButton
        iconDescription={closeButtonDescription}
        {lowContrast}
        onclick={() => notification.close("close-button")}
      />
    {/if}
  </div>
{/if}
