<script>
  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set the size of the composed modal.
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

    /**
     * Set to `true` to enable alert mode.
     * The dialog uses `role="alertdialog"` and is described by `ModalBody`.
     */
    alert = false,

    /** Set to `true` to remove the modal body padding so content spans edge to edge */
    fullWidth = false,

    /**
     * Control whether clicking outside the modal closes it.
     * By default, a passive modal (one without a `ModalFooter`) closes and a
     * modal with a `ModalFooter` stays open, as in Carbon v11.
     * Set to `true` to always keep the modal open on an outside click, or
     * `false` to always close it.
     * @type {boolean | undefined}
     */
    preventCloseOnClickOutside = undefined,

    /**
     * Specify a selector to be focused when opening the modal.
     * @type {null | string}
     */
    selectorPrimaryFocus = "[data-modal-primary-focus]",

    /**
     * Set to `true` to build the modal's content the first time it opens
     * instead of at mount, and keep it afterwards. A closed modal is still
     * laid out (it is only made invisible), so this saves its nodes on pages
     * that hold modals most visitors never open. Content is not in the DOM,
     * or in server-rendered markup, until then.
     */
    lazy = false,

    /**
     * Obtain a reference to the top-level HTML element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * Set an id for the top-level element.
     * The header label, header title, and body ids derive from it as
     * `{id}-label`, `{id}-title`, and `{id}-body`.
     
     * @type {string}
     */
    id = fallbackId,

    /**
     * Called when the user closes the modal: the close button, Escape, an
     * outside click, or a `ModalFooter` secondary button. Call
     * `preventDefault()` to keep it open. Not called when `open` changes
     * from outside.
     * @type {((detail: import("../utils/cancelable.js").Cancelable<{ open: boolean; trigger: "escape-key" | "outside-click" | "close-button" }>) => void) | undefined}
     */
    onopenchange = undefined,

    /**
     * Called after the open or close transition ends.
     * @type {((detail: { open: boolean }) => void) | undefined}
     */
    onopenchangecomplete = undefined,

    /**
     * Called when the user activates the `ModalFooter` primary button.
     * @type {((detail: { trigger: "button" }) => void) | undefined}
     */
    onprimaryaction = undefined,

    /**
     * The header, body and footer.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * Render an `AILabel` or another decorator in the corner.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": consumerLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-labelledby": consumerLabelledby = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLDivElement> | undefined | null} */
    onmousedown = undefined,

    ...rest
  } = $props();












  import { onMount, setContext, tick, untrack } from "svelte";
  import { readable, writable } from "svelte/store";
  import Decorator from "../AILabel/Decorator.svelte";
  import { trackModal } from "../Modal/modal-store.js";
  import {
    LAYER_CONTEXT_KEY,
    MODAL_CONTEXT_KEY,
  } from "../constants/context-keys.js";
  import { cancelable } from "../utils/cancelable.js";
  import { createDialogLifecycle } from "../utils/dialog-lifecycle.js";
  import { joinDescribedBy } from "../utils/field-status.js";
  import { focusQuietly, initialFocus, restoreFocus } from "../utils/focus.js";
  import { isImeComposition } from "../utils/ime-composition.js";
  import { trapFocus } from "../utils/trap-focus.js";
  import { setComposedModal } from "./composed-modal-context.js";

  const focusReturn = restoreFocus();

  // Set by ModalHeader. Ids for its label/title headings let ModalBody
  // (when `hasScrollingContent`) name its region via `aria-labelledby`.
  /** @type {string | undefined} */
  let label = $state();
  /** @type {string | undefined} */
  let title = $state();
  /** @type {string | undefined} */
  let bodyId = $state();
  const ids = $derived({
    label: `${id}-label`,
    title: `${id}-title`,
    body: `${id}-body`,
  });

  /** @type {null | HTMLDivElement} */
  let innerModalRef = $state(null);
  let mounted = $state(false);
  // Live ModalFooters. Without one the modal is passive (Carbon v11).
  let footerCount = 0;
  // Live ModalHeaders. The last one to unmount clears the label and
  // title. Svelte 5 unmounts a swapped-out header after its replacement
  // has set them, so a header can't simply clear them itself.
  let headerCount = 0;

  /**
   * A user close becomes a cancelable `onopenchange`; an open or a close
   * set from outside calls nothing.
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

  const lifecycle = createDialogLifecycle({
    dispatch: lifecycleEvent,
    setOpen: (value) => {
      open = value;
    },
    preventCloseOnClickOutside: () => preventCloseOnClickOutside,
    passive: () => footerCount === 0,
    saveFocusReturn: focusReturn.save,
    restoreFocusReturn: () => focusReturn.restore(ref),
    getContainer: () => innerModalRef,
    focus: () => focus(),
    getOpen: () => open,
  });
  const { close, outsideDismiss } = lifecycle;

  // `lazy`: the content mounts on the first open and then stays.
  let openedOnce = $state(untrack(() => open));
  $effect.pre(() => {
    if (open) openedOnce = true;
  });

  setContext(MODAL_CONTEXT_KEY, {});
  // As in v11, the modal starts a layer at level 0 wherever it renders.
  // ModalHeader and ModalFooter sit on it; ModalBody steps up to level 1.
  setContext(LAYER_CONTEXT_KEY, readable(1));
  setComposedModal({
    get ids() {
      return ids;
    },
    get label() {
      return label;
    },
    get title() {
      return title;
    },
    setHeading(nextLabel, nextTitle) {
      label = nextLabel;
      title = nextTitle;
    },
    registerHeader() {
      headerCount += 1;
      return () => {
        headerCount -= 1;
        if (headerCount === 0) {
          label = undefined;
          title = undefined;
        }
      };
    },
    registerFooter() {
      footerCount += 1;
      return () => {
        footerCount -= 1;
      };
    },
    setBodyId(value) {
      bodyId = value;
    },
    closeModal() {
      close("close-button");
    },
    primaryAction() {
      onprimaryaction?.({ trigger: "button" });
    },
  });

  /** @param {HTMLElement} [node] */
  function focus(node) {
    const container = node || innerModalRef;
    const target = initialFocus({
      container,
      selectorPrimaryFocus,
      fallbacks: [
        danger
          ? container?.querySelector(".bx--btn--secondary")
          : container?.querySelector(".bx--btn--primary"),
        container?.querySelector(".bx--modal-close"),
        // With nothing else to focus, focus the dialog itself so Escape
        // and Tab reach the root's keydown handler.
        container,
      ],
    });
    // The user didn't ask for a tooltip on the first focus target, so a
    // single Escape still closes the modal.
    if (target) focusQuietly(target);
  }

  const sharedOpen = writable(untrack(() => open));
  $effect.pre(() => {
    sharedOpen.set(open);
  });
  trackModal(sharedOpen);

  // Name the dialog from ModalHeader's label/title. The header registers
  // them after this element is serialized, so on the server (and the first
  // client render) point at its heading ids instead. An id with no element
  // is ignored; once mounted with no heading, there is nothing to point at.
  // The server cannot tell which headings the header renders, so it names the
  // dialog from both ("Label Title"); after mount the name is `label || title`
  // (the label alone when both are set). The name is a superset until then.
  const ariaLabel = $derived(
    consumerLabel ??
      (consumerLabelledby == null ? label || title || undefined : undefined),
  );
  const ariaLabelledby = $derived(
    consumerLabelledby ??
      (consumerLabel == null && !mounted && !label && !title
        ? `${ids.label} ${ids.title}`
        : undefined),
  );

  onMount(() => {
    mounted = true;
    lifecycle.setMounted();
    if (open) {
      tick().then(() => {
        if (open) focus();
      });
    }
  });

  $effect.pre(() => {
    lifecycle.syncOpen(open);
  });

  /** @type {import("svelte/store").Writable<undefined | "active" | "revert">} */
  const aiLabelState = writable(untrack(() => decorator) ? "active" : undefined);
</script>

<div
  bind:this={ref}
  role="presentation"
  class={[
    "bx--modal",
    "bx--layer-one",
    open && "is-visible",
    danger && "bx--modal--danger",
    decorator && "bx--modal--decorator",
    $aiLabelState === "active" && "bx--modal--ai-label",
  ]}
  inert={open ? undefined : true}
  {id}
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
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={innerModalRef}
    tabindex="-1"
    role={alert ? "alertdialog" : "dialog"}
    aria-describedby={joinDescribedBy(alert ? bodyId : undefined, ariaDescribedBy)}
    aria-modal="true"
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
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
    {#if !lazy || openedOnce}
      {@render children?.()}
    {/if}
    {#if decorator}
      <Decorator
        class="bx--modal--inner__decorator"
        state={aiLabelState}
        labelSize="sm"
      >
        {@render decorator()}
      </Decorator>
    {/if}
  </div>
</div>
