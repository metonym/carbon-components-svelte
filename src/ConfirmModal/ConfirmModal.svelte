<script>
  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set to `true` to open the modal.
     */
    open = $bindable(false),

    /**
     * Set the kind of confirmation.
     * `"danger"` uses Modal's danger variant and `"warning"` adds a warning
     * icon next to the heading; both are announced as an alert dialog.
     * `"info"` is a plain dialog.
     * @type {"danger" | "warning" | "info"}
     */
    kind = "danger",

    /**
     * Specify the modal heading, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    titleText,

    /**
     * Specify the modal label, or a snippet.
     * @type {string | import("svelte").Snippet | undefined}
     */
    labelText = undefined,

    /** Specify the confirm button text */
    confirmText = "Confirm",

    /** Specify the cancel button text */
    cancelText = "Cancel",

    /**
     * When set, the user must type this exact phrase before the confirm
     * button becomes enabled.
     * @type {string | undefined}
     */
    confirmationPhrase = undefined,

    /**
     * Specify the label for the type-to-confirm input.
     * @type {(phrase: string) => string}
     */
    confirmationLabel = (phrase) => `Type ${phrase} to confirm`,

    /**
     * Specify the work to run on confirm. When it returns a promise, the
     * modal shows its loading state until the promise settles: it closes on
     * success, and on failure stays open and calls `onconfirmerror`.
     * Without it, or when it returns nothing, the modal closes on confirm.
     * @type {undefined | (() => void | Promise<unknown>)}
     */
    confirm = undefined,

    /**
     * Set to `true` to show a loading state on the confirm button and block
     * closing, for work the app tracks itself. `confirm` sets this state on
     * its own.
     */
    loading = false,

    /** Specify the description for the confirm button loading state */
    loadingDescription = "Working",

    /**
     * Set the size of the modal.
     * Also accepts Carbon v11's `"md"`, the width of a `Modal` with no size.
     * @type {"xs" | "sm" | "md" | "lg"}
     */
    size = "xs",

    /** Set to `false` to allow closing the modal when clicking outside */
    preventCloseOnClickOutside = true,

    /**
     * Set an id for the top-level element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Obtain a reference to the top-level HTML element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user confirms, before `confirm` runs.
     * @type {(() => void) | undefined}
     */
    onconfirm = undefined,

    /**
     * Called when `confirm` throws or rejects. The modal stays open.
     * @type {((detail: { error: unknown }) => void) | undefined}
     */
    onconfirmerror = undefined,

    /**
     * Called when the user cancels: the cancel button, the close button,
     * Escape, or an outside click. Call `preventDefault()` to keep the modal
     * open. Never called while the confirm is loading, which blocks closing,
     * or when `open` changes from outside.
     * @type {((detail: import("../utils/cancelable.js").Cancelable<{ open: boolean; trigger: "escape-key" | "outside-click" | "close-button" | "cancel-button" }>) => void) | undefined}
     */
    onopenchange = undefined,

    /**
     * The modal body.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    ...rest
  } = $props();

  import { tick, untrack } from "svelte";
  import Modal from "../Modal/Modal.svelte";
  import TextInput from "../TextInput/TextInput.svelte";
  import WarningAltFilled from "../icons/WarningAltFilled.svelte";
  import { cancelable } from "../utils/cancelable.js";

  let phraseValue = $state("");
  /** @type {null | HTMLInputElement} */
  let phraseInputRef = $state(null);
  /** Whether a `confirm` promise is in flight. */
  let pending = $state(false);
  /** Counts opens, so work from an earlier opening can't close a later one. */
  let session = 0;

  const busy = $derived(loading || pending);

  // A pasted phrase often brings a trailing space, and the same accented
  // text can arrive in a different Unicode form.
  /** @param {string} text */
  const canonical = (text) => text.trim().normalize("NFC");
  const phraseMatches = $derived(
    confirmationPhrase == null ||
      canonical(phraseValue) === canonical(confirmationPhrase),
  );

  const phraseLabel = $derived(
    confirmationPhrase == null ? "" : confirmationLabel(confirmationPhrase),
  );
  // Page translators would translate the phrase too, so the user would type
  // a word that never matches; the phrase is marked not to translate.
  const phraseAt = $derived(
    confirmationPhrase == null ? -1 : phraseLabel.indexOf(confirmationPhrase),
  );

  let prevOpen = false;
  $effect.pre(() => {
    if (open && !prevOpen) {
      untrack(() => {
        phraseValue = "";
        session += 1;
        // The earlier opening's confirm is now ignored, so it can't clear this.
        pending = false;
      });
    }
    prevOpen = open;
  });

  // Destructive confirms focus the cancel button first so a stray Enter or
  // Space doesn't confirm accidentally; the confirm button is not reachable
  // via Modal's default `[data-modal-primary-focus]` selector, so the
  // secondary button is targeted directly by class.
  const selectorPrimaryFocus = $derived(
    confirmationPhrase == null
      ? ".bx--modal-footer .bx--btn--secondary"
      : `#${id}-confirm-modal-phrase`,
  );

  // A snippet heading can't name the dialog as text.
  const ariaName = $derived(
    typeof titleText === "string" ? titleText : undefined,
  );

  async function handleConfirm() {
    // A second Enter or click while the first is still running is ignored.
    if (!phraseMatches || busy) return;
    onconfirm?.();
    const current = session;
    let result;
    try {
      result = confirm?.();
    } catch (error) {
      onconfirmerror?.({ error });
      return;
    }
    if (
      typeof (
        /** @type {PromiseLike<unknown> | undefined} */ (result)?.then
      ) !== "function"
    ) {
      open = false;
      return;
    }
    pending = true;
    try {
      await result;
      if (current === session) open = false;
    } catch (error) {
      if (current === session) onconfirmerror?.({ error });
    } finally {
      if (current === session) pending = false;
    }
  }

  /**
   * @param {import("../utils/cancelable.js").Cancelable<{ open: boolean; trigger: "escape-key" | "outside-click" | "close-button" }>} detail
   */
  function handleModalClose(detail) {
    if (busy) {
      detail.preventDefault();
      return;
    }
    const payload = cancelable({ open: false, trigger: detail.trigger });
    onopenchange?.(payload);
    if (payload.defaultPrevented) detail.preventDefault();
  }

  function handleCancelButton() {
    const payload = cancelable({
      open: false,
      trigger: /** @type {const} */ ("cancel-button"),
    });
    onopenchange?.(payload);
    if (!payload.defaultPrevented) open = false;
  }

  // The confirm button is disabled while loading, which drops the focus it
  // had. If the work fails and the modal stays open, put focus back on it,
  // a tick later so Modal has re-enabled the button first.
  let prevBusy = false;
  $effect(() => {
    if (prevBusy && !busy && open) {
      tick().then(() => {
        if (!open || ref?.contains(document.activeElement)) return;
        /** @type {null | HTMLButtonElement} */ (
          ref?.querySelector(".bx--modal-footer .bx--btn:last-child")
        )?.focus();
      });
    }
    prevBusy = busy;
  });
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<Modal
  bind:open
  bind:ref
  {id}
  danger={kind === "danger"}
  alert={kind !== "info"}
  {size}
  modalLabel={labelText}
  modalAriaLabel={ariaName}
  primaryButtonText={confirmText}
  primaryButtonDisabled={!phraseMatches || busy}
  primaryButtonLoading={busy}
  primaryButtonLoadingDescription={loadingDescription}
  secondaryButtons={[{ text: cancelText, disabled: busy }]}
  preventCloseOnClickOutside={preventCloseOnClickOutside || busy}
  {selectorPrimaryFocus}
  {...rest}
  onopenchange={handleModalClose}
  onprimaryaction={handleConfirm}
  onsecondaryaction={handleCancelButton}
>
  {#snippet modalHeading()}
    {#if kind === "warning"}
      <WarningAltFilled
        size={20}
        class="bx--confirm-modal__heading-icon"
        aria-hidden="true"
      />
    {/if}
    {@render content(titleText)}
  {/snippet}
  {@render children?.()}
  {#if confirmationPhrase != null}
    <div class="bx--confirm-modal__phrase">
      <TextInput
        bind:ref={phraseInputRef}
        id="{id}-confirm-modal-phrase"
        bind:value={phraseValue}
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        data-1p-ignore
        data-lpignore="true"
        data-bwignore
        data-form-type="other"
      >
        {#snippet labelText()}
          {#if phraseAt === -1}
            {phraseLabel}
          {:else}
            {phraseLabel.slice(0, phraseAt)}<span
              class="bx--confirm-modal__phrase-text notranslate"
              translate="no">{confirmationPhrase}</span
            >{phraseLabel.slice(phraseAt + (confirmationPhrase ?? "").length)}
          {/if}
        {/snippet}
      </TextInput>
    </div>
  {/if}
</Modal>
