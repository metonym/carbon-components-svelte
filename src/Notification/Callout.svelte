<script>
  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the kind of callout.
     * @type {"error" | "info" | "info-square" | "success" | "warning" | "warning-alt"}
     */
    kind = "info",

    /** Set to `true` to use the low contrast variant */
    lowContrast = false,

    /**
     * Specify the title text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    titleText = "",

    /**
     * Specify the subtitle text, or a snippet, such as for a link.
     * @type {string | import("svelte").Snippet}
     */
    subtitleText = "",

    /**
     * Specify the id of the title element. A `NotificationActionButton` in
     * the callout is described by it. Point the `aria-describedby` of other
     * interactive content, such as a link, at the same id.
     * @type {string}
     */
    titleId = fallbackId,

    /**
     * Specify the label of the status icon for screen readers.
     * Defaults to the kind, such as "Warning".
     * @type {string | undefined}
     */
    statusIconDescription = undefined,

    /**
     * Set to `true` for the callout to fill its parent's width, without the
     * default width limits, as when it sits inside a tile or a form.
     */
    fullWidth = false,

    /**
     * Extra content under the subtitle.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * An action, such as a `NotificationActionButton`.
     * @type {import("svelte").Snippet | undefined}
     */
    actions = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import NotificationIcon from "./NotificationIcon.svelte";
  import { setNotificationAction } from "./notification-context.js";
  import { kindClasses } from "./notification-kind-classes.js";
  import { statusIconLabel } from "./status-icon-label.js";

  // `kind` with its declared type, which the type checker reads from the
  // default value alone.
  const notificationKind = $derived(
    /** @type {import("./notification-kind-classes.js").NotificationKind} */ (
      kind
    ),
  );

  setNotificationAction({
    get describedBy() {
      return titleText ? titleId : undefined;
    },
    toast: false,
  });
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<div
  {...rest}
  class={[
    "bx--inline-notification bx--inline-notification--callout bx--inline-notification--hide-close-button",
    lowContrast
      ? "bx--inline-notification--low-contrast"
      : "bx--inline-notification--high-contrast",
    fullWidth && "bx--inline-notification--full-width",
    ...kindClasses("inline", notificationKind, lowContrast),
    className,
  ]}
>
  <div class="bx--inline-notification__details">
    <NotificationIcon
      notificationType="inline"
      kind={notificationKind}
      {lowContrast}
      iconDescription={statusIconDescription ||
        statusIconLabel(notificationKind)}
    />
    <div class="bx--inline-notification__text-wrapper">
      {#if titleText}
        <p id={titleId} class="bx--inline-notification__title">
          <strong>{@render content(titleText)}</strong>
        </p>
      {/if}
      {#if subtitleText}
        <div class="bx--inline-notification__subtitle">
          {@render content(subtitleText)}
        </div>
      {/if}
      {@render children?.()}
    </div>
  </div>
  {@render actions?.()}
</div>
