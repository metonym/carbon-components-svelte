<script>
  /** @template {import("../utils/icon-component.js").IconComponent} [Icon=any] */

  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set the size of the modal.
     * Also accepts Carbon v11's `"md"`, the default width.
     * @type {"xs" | "sm" | "md" | "lg" | undefined}
     */
    size = undefined,

    /**
     * Set to `true` to open the modal.
     */
    open = $bindable(false),

    /** Set to `true` to use the danger variant */
    danger = false,

    /** Set to `true` to enable alert mode */
    alert = false,

    /** Set to `true` to use the passive variant */
    passiveModal = false,

    /** Set to `true` to remove the modal body padding so content spans edge to edge */
    fullWidth = false,

    /**
     * Specify the modal heading, or a snippet.
     * @type {string | import("svelte").Snippet | undefined}
     */
    modalHeading = undefined,

    /**
     * Specify the modal label, or a snippet.
     * @type {string | import("svelte").Snippet | undefined}
     */
    modalLabel = undefined,

    /**
     * Specify the ARIA label for the modal.
     * @type {string | undefined}
     */
    modalAriaLabel = undefined,

    /**
     * Specify the label of the close button.
     * It names the button and shows in its tooltip.
     */
    iconDescription = "Close the modal",

    /** Set to `true` if the modal contains form elements */
    hasForm = false,

    /**
     * Specify the ID of a form element to associate with the primary button.
     * This enables the primary button to submit the form from outside the form element.
     * @type {string | undefined}
     */
    formId = undefined,

    /** Set to `true` if the modal contains scrolling content */
    hasScrollingContent = false,

    /** Specify the primary button text */
    primaryButtonText = "",

    /** Set to `true` to disable the primary button */
    primaryButtonDisabled = false,

    /**
     * Set to `true` to show a loading state on the primary button.
     * While loading, the button is non-interactive and submit is suppressed.
     * Same as `loadingStatus="active"`, except that the secondary buttons
     * stay enabled. `loadingStatus` wins when it is not `"inactive"`.
     */
    primaryButtonLoading = false,

    /**
     * Set the loading status of the footer.
     * Any status other than `"inactive"` shows `InlineLoading` with that
     * status in the primary button, disables the footer buttons, and
     * suppresses the primary action. `"finished"` calls `onloadingsuccess`
     * after the success delay.
     * @type {"inactive" | "active" | "finished" | "error"}
     */
    loadingStatus = "inactive",

    /**
     * Specify the description for the primary button loading state.
     * Passed to `InlineLoading` as `description`.
     */
    primaryButtonLoadingDescription = "Loading",

    /**
     * Specify the description for the primary button loading icon.
     * Passed to `InlineLoading` as `iconDescription`.
     * @type {string | undefined}
     */
    primaryButtonLoadingIconDescription = undefined,

    /**
     * Specify the primary button icon.
     * @type {Icon | undefined}
     */
    primaryButtonIcon = /** @type {Icon | undefined} */ (undefined),

    /**
     * Set to `true` to call `onprimaryaction` when the user presses Enter
     * in the modal (outside buttons, links, text areas and selects).
     */
    shouldSubmitOnEnter = true,

    /** Specify the secondary button text */
    secondaryButtonText = "",

    /**
     * Set to `true` to show a loading state on the secondary button.
     * Only applies to the `secondaryButtonText` path (not `secondaryButtons`).
     * While loading, the button is non-interactive.
     */
    secondaryButtonLoading = false,

    /**
     * Specify the description for the secondary button loading state.
     * Passed to `InlineLoading` as `description`.
     */
    secondaryButtonLoadingDescription = "Loading",

    /**
     * One or two secondary buttons for the modal footer.
     * Supersedes `secondaryButtonText`. Each entry needs `text`; optional
     * `kind` (defaults to `"secondary"`), `disabled`, `loading`, and
     * `loadingDescription` (defaults to `"Loading"`) pass through to Button /
     * the loading state. With two entries plus a primary button, the footer
     * uses the three-button layout.
     * @type {ReadonlyArray<{ text: string; kind?: import("../Button/Button.svelte").ButtonProps["kind"]; disabled?: boolean; loading?: boolean; loadingDescription?: string }>}
     */
    secondaryButtons = [],

    /**
     * Specify a selector to be focused when opening the modal.
     * Set to `null` to skip initial focus and move focus yourself.
     * @type {null | string}
     */
    selectorPrimaryFocus = "[data-modal-primary-focus]",

    /**
     * Control whether clicking outside the modal closes it.
     * By default, a passive modal (`passiveModal`) closes and a modal with
     * actions stays open, as in Carbon v11.
     * Set to `true` to always keep the modal open on an outside click, or
     * `false` to always close it.
     * @type {boolean | undefined}
     */
    preventCloseOnClickOutside = undefined,

    /**
     * Set to `true` to hide the header close button.
     * Provide an alternative dismiss path (footer actions or Escape).
     */
    hideCloseButton = false,

    /**
     * Set to `true` to build the modal's content the first time it opens
     * instead of at mount, and keep it afterwards. A closed modal is still
     * laid out (it is only made invisible), so this saves its nodes on pages
     * that hold modals most visitors never open. Content is not in the DOM,
     * or in server-rendered markup, until then.
     */
    lazy = false,

    /** Set an id for the top-level element 
     * @type {string}
     */
    id = fallbackId,

    /**
     * Obtain a reference to the top-level HTML element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user closes the modal: the close button, Escape, or
     * an outside click. Call `preventDefault()` to keep it open. Not called
     * when `open` changes from outside.
     * @type {((detail: import("../utils/cancelable.js").Cancelable<{ open: boolean; trigger: "escape-key" | "outside-click" | "close-button" }>) => void) | undefined}
     */
    onopenchange = undefined,

    /**
     * Called after the open or close transition ends.
     * @type {((detail: { open: boolean }) => void) | undefined}
     */
    onopenchangecomplete = undefined,

    /**
     * Called when the user activates the primary button, by click or by
     * pressing Enter (see `shouldSubmitOnEnter`).
     * @type {((detail: { trigger: "button" | "enter-key" }) => void) | undefined}
     */
    onprimaryaction = undefined,

    /**
     * Called when the user clicks a secondary button.
     * @type {((detail: { text: string }) => void) | undefined}
     */
    onsecondaryaction = undefined,

    /**
     * Called when `loadingStatus` is `"finished"`, after the
     * `InlineLoading` success delay.
     * @type {(() => void) | undefined}
     */
    onloadingsuccess = undefined,

    /**
     * The modal content.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * Render an `AILabel` or another decorator in the header.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": consumerLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLDivElement> | undefined | null} */
    onmousedown = undefined,

    ...rest
  } = $props();
































  import { onMount, setContext, untrack } from "svelte";
  import { readable, writable } from "svelte/store";
  import Decorator from "../AILabel/Decorator.svelte";
  import Button from "../Button/Button.svelte";
  import InlineLoading from "../InlineLoading/InlineLoading.svelte";
  import {
    LAYER_CONTEXT_KEY,
    MODAL_CONTEXT_KEY,
  } from "../constants/context-keys.js";
  import Close from "../icons/Close.svelte";
  import { cancelable } from "../utils/cancelable.js";
  import { createDialogLifecycle } from "../utils/dialog-lifecycle.js";
  import { joinDescribedBy } from "../utils/field-status.js";
  import { focusQuietly, initialFocus, restoreFocus } from "../utils/focus.js";
  import { isImeComposition } from "../utils/ime-composition.js";
  import { scrollIntoViewWithin } from "../utils/scroll-into-view-within.js";
  import { trapFocus } from "../utils/trap-focus.js";
  import { trackModal } from "./modal-store.js";

  const focusReturn = restoreFocus();

  /** @type {null | HTMLAnchorElement | HTMLButtonElement} */
  let buttonRef = $state(null);
  /** @type {null | HTMLAnchorElement | HTMLButtonElement} */
  let primaryButtonRef = $state(null);
  /** @type {null | HTMLDivElement} */
  let innerModalRef = $state(null);

  /**
   * The dialog lifecycle reports closes as events. A user close becomes a
   * cancelable `onopenchange`; an open or a close set from outside calls
   * nothing.
   * @param {string} type
   * @param {{ trigger?: string }} [detail]
   */
  function lifecycleEvent(type, detail) {
    if (type !== "close" || !detail?.trigger || detail.trigger === "programmatic")
      return true;
    const payload = cancelable({
      open: false,
      trigger: /** @type {"escape-key" | "outside-click" | "close-button"} */ (
        detail.trigger
      ),
    });
    onopenchange?.(payload);
    return !payload.defaultPrevented;
  }

  /** @param {HTMLElement} [node] */
  function focus(node) {
    const container = node || innerModalRef;
    const target = initialFocus({
      container,
      selectorPrimaryFocus,
      fallbacks: [
        danger ? container.querySelector(".bx--btn--secondary") : null,
        primaryButtonRef,
        buttonRef,
        // With nothing else to focus, focus the dialog itself so Escape
        // and Tab reach the root's keydown handler.
        container,
      ],
    });
    // The user didn't ask for a tooltip on the first focus target, so a
    // single Escape still closes the modal.
    if (target) focusQuietly(target);
  }

  const lifecycle = createDialogLifecycle({
    dispatch: lifecycleEvent,
    setOpen: (value) => {
      open = value;
    },
    preventCloseOnClickOutside: () => preventCloseOnClickOutside,
    passive: () => passiveModal,
    saveFocusReturn: focusReturn.save,
    restoreFocusReturn: () => focusReturn.restore(ref),
    getContainer: () => innerModalRef,
    focus: () => focus(),
    getOpen: () => open,
  });
  const { close, outsideDismiss } = lifecycle;

  const sharedOpen = writable(untrack(() => open));
  $effect.pre(() => {
    sharedOpen.set(open);
  });
  trackModal(sharedOpen);

  setContext(MODAL_CONTEXT_KEY, {});
  // As in v11, the modal starts a layer at level 0 wherever it renders,
  // and its body is a layer at level 1, so a `Layer` inside sits at 2.
  setContext(LAYER_CONTEXT_KEY, readable(2));

  // The lifecycle effect below handles the `prevOpen`/`focusReturn.save()`
  // bookkeeping. It runs before the DOM is committed, so it can't focus
  // the modal; `onMount` runs after mount, with the DOM in place.
  onMount(() => {
    lifecycle.setMounted();
    if (open) {
      focus();
    }
  });

  $effect.pre(() => {
    lifecycle.syncOpen(open);
  });

  // `lazy`: the body and footer mount on the first open and then stay.
  let openedOnce = $state(untrack(() => open));
  $effect.pre(() => {
    if (open) openedOnce = true;
  });
  const renderContent = $derived(!lazy || openedOnce);

  const modalLabelId = $derived(`bx--modal-header__label--modal-${id}`);
  const modalHeadingId = $derived(`bx--modal-header__heading--modal-${id}`);
  const modalBodyId = $derived(`bx--modal-body--${id}`);
  // A consumer `aria-label` names the dialog. The scrolling region keeps
  // the built-in name so the consumer label stays on the dialog alone. A
  // snippet label or heading names nothing; use `modalAriaLabel` then.
  const builtInLabel = $derived(
    [modalLabel, modalAriaLabel, modalHeading].find(
      (value) => value != null && typeof value !== "function",
    ),
  );
  const ariaLabel = $derived(consumerLabel ?? builtInLabel);

  const footerBusy = $derived(
    Boolean(loadingStatus) && loadingStatus !== "inactive",
  );
  // `primaryButtonLoading` is the boolean form of "active"; a status
  // other than "inactive" takes precedence.
  const primaryStatus = $derived(
    footerBusy ? loadingStatus : primaryButtonLoading ? "active" : "inactive",
  );
  const primaryBusy = $derived(primaryStatus !== "inactive");

  /** @param {"button" | "enter-key"} trigger */
  function primaryAction(trigger) {
    if (primaryBusy) return;
    onprimaryaction?.({ trigger });
  }

  /**
   * Starts active when a decorator is passed, so the server renders the AI
   * surface. `Decorator` clears it when no `AILabel` claims it.
   * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
   */
  const aiLabelState = writable(untrack(() => decorator) ? "active" : undefined);
</script>

{#snippet content(/** @type {string | import("svelte").Snippet | undefined} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

{#snippet closeButton()}
  <div class="bx--modal-close-button">
    <Button
      bind:ref={buttonRef}
      kind="ghost"
      class="bx--modal-close"
      {iconDescription}
      aria-label={iconDescription}
      tooltipPosition="left"
      onclick={() => {
        close("close-button");
      }}
    >
      {#snippet iconChildren()}<Close
          size={20}
          class="bx--modal-close__icon"
          aria-hidden="true"
        />{/snippet}
    </Button>
  </div>
{/snippet}

<div
  bind:this={ref}
  role="presentation"
  {id}
  class={[
    "bx--modal",
    "bx--layer-one",
    !passiveModal && "bx--modal-tall",
    open && "is-visible",
    danger && "bx--modal--danger",
    decorator && "bx--modal--decorator",
    $aiLabelState === "active" && "bx--modal--ai-label",
  ]}
  inert={open ? undefined : true}
  onkeydown={(event) => {
    if (open) {
      if (event.key === "Escape") {
        // Escape that cancels an IME composition is not a close.
        if (isImeComposition(event)) return;
        // Stop stacked (DOM-nested) modals from also closing: this
        // handler is on each modal's own root and Escape bubbles from
        // the focused (innermost, topmost) modal up through ancestors.
        event.stopPropagation();
        close("escape-key");
      } else if (event.key === "Tab" && !event.defaultPrevented) {
        // A nested modal or a child that uses Tab itself (an editor that
        // indents) already handled this Tab; trapping again moves focus twice.
        trapFocus({ container: ref, event });
      } else if (
        shouldSubmitOnEnter &&
        event.key === "Enter" &&
        !primaryButtonDisabled &&
        !primaryBusy
      ) {
        // Enter that commits an IME composition is not a submit.
        if (isImeComposition(event)) return;
        const target = /** @type {HTMLElement | null} */ (event.target);
        const tag = target?.tagName;
        if (
          tag === "BUTTON" ||
          tag === "A" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target?.isContentEditable
        ) {
          return;
        }
        if (formId && primaryButtonRef) {
          primaryButtonRef.click();
        } else {
          primaryAction("enter-key");
        }
      }
    }
  }}
  onmousedown={(event) => {
    if (event.target === event.currentTarget) outsideDismiss.pressOutside();
  }}
  onmouseup={outsideDismiss.release}
  ontransitionend={(event) => {
    if (event.propertyName === "transform") {
      onopenchangecomplete?.({ open });
      if (!open) focusReturn.restore(ref);
    }
  }}
>
  <div
    bind:this={innerModalRef}
    tabindex="-1"
    role={alert ? (passiveModal ? "alert" : "alertdialog") : "dialog"}
    aria-describedby={joinDescribedBy(
      alert && !passiveModal ? modalBodyId : undefined,
      ariaDescribedBy,
    )}
    aria-modal="true"
    aria-label={ariaLabel}
    {...rest}
    class={[
      "bx--modal-container",
      size === "xs" && "bx--modal-container--xs",
      size === "sm" && "bx--modal-container--sm",
      size === "lg" && "bx--modal-container--lg",
      fullWidth && "bx--modal-container--full-width",
      className,
    ]}
    onmousedown={(event) => {
      outsideDismiss.pressInside();
      onmousedown?.(event);
    }}
  >
    <div class="bx--modal-header">
      {#if passiveModal && !hideCloseButton}
        {@render closeButton()}
      {/if}
      {#if modalLabel}
        <h2 id={modalLabelId} class="bx--modal-header__label">
          {@render content(modalLabel)}
        </h2>
      {/if}
      <h2 id={modalHeadingId} class="bx--modal-header__heading">
        {@render content(modalHeading)}
      </h2>
      {#if decorator}
        <Decorator
          class="bx--modal--inner__decorator"
          state={aiLabelState}
          labelSize="sm"
        >
          {@render decorator()}
        </Decorator>
      {/if}
      {#if !passiveModal && !hideCloseButton}
        {@render closeButton()}
      {/if}
    </div>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      id={modalBodyId}
      class:bx--modal-content={true}
      class:bx--layer-two={true}
      class:bx--modal-content--with-form={hasForm}
      class:bx--modal-scroll-content={hasScrollingContent}
      tabindex={hasScrollingContent ? 0 : undefined}
      role={hasScrollingContent ? "region" : undefined}
      aria-label={hasScrollingContent ? builtInLabel : undefined}
      aria-labelledby={modalLabel ? modalLabelId : modalHeadingId}
      onfocusin={(event) => {
        // Keep a newly-focused element (e.g. via Tab) from being hidden
        // under the scroll gradient at the bottom of the content area.
        if (event.target instanceof HTMLElement) {
          scrollIntoViewWithin(event.target, ".bx--modal-content");
        }
      }}
    >
      {#if renderContent}
        {@render children?.()}
      {/if}
    </div>
    {#if hasScrollingContent}
      <div class:bx--modal-content--overflow-indicator={true}></div>
    {/if}
    {#if !passiveModal && renderContent}
      <div
        class:bx--modal-footer={true}
        class:bx--modal-footer--three-button={secondaryButtons.length === 2}
        aria-busy={primaryStatus === "active" ? "true" : undefined}
      >
        {#if secondaryButtons.length > 0}
          {#each secondaryButtons as button (button.text)}
            <Button
              size="default"
              kind={button.kind ?? "secondary"}
              disabled={button.disabled || button.loading || footerBusy}
              onclick={() => {
                if (button.loading || footerBusy) return;
                onsecondaryaction?.({ text: button.text });
              }}
            >
              {#if button.loading}
                <InlineLoading
                  class="bx--inline-loading--btn"
                  status="active"
                  description={button.loadingDescription ?? "Loading"}
                />
              {:else}
                {button.text}
              {/if}
            </Button>
          {/each}
        {:else if secondaryButtonText}
          <Button
            size="default"
            kind="secondary"
            disabled={secondaryButtonLoading || footerBusy}
            onclick={() => {
              if (secondaryButtonLoading || footerBusy) return;
              onsecondaryaction?.({ text: secondaryButtonText });
            }}
          >
            {#if secondaryButtonLoading}
              <InlineLoading
                class="bx--inline-loading--btn"
                status="active"
                description={secondaryButtonLoadingDescription}
              />
            {:else}
              {secondaryButtonText}
            {/if}
          </Button>
        {/if}
        <Button
          size="default"
          bind:ref={primaryButtonRef}
          kind={danger ? "danger" : "primary"}
          disabled={primaryButtonDisabled || primaryBusy}
          icon={primaryBusy ? undefined : primaryButtonIcon}
          type={formId ? "submit" : "button"}
          form={formId}
          onclick={() => primaryAction("button")}
        >
          {#if primaryBusy}
            <InlineLoading
              class="bx--inline-loading--btn"
              status={primaryStatus}
              description={primaryButtonLoadingDescription}
              iconDescription={primaryButtonLoadingIconDescription}
              on:success={() => onloadingsuccess?.()}
            />
          {:else}
            {primaryButtonText}
          {/if}
        </Button>
      </div>
    {/if}
  </div>
</div>
