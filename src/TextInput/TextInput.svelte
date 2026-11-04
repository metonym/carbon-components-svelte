<script>
  /**
   * @restProps {input}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set the size of the input.
     * Inherits the parent `Form` size when unset.
     * Also accepts Carbon v11's `"md"` (the 40px default, which overrides a
     * `Form` size) and `"lg"` (`"xl"`).
     * @type {"xs" | "sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /**
     * Specify the input value.
     *
     * `value` will be set to `null` if type="number" and the value is empty.
     * Follows the field when the owning form resets.
     * @type {null | number | string}
     */
    value = $bindable(/** @type {null | number | string} */ ("")),

    /** Set to `true` to disable the input */
    disabled = false,

    /** Specify the helper text */
    helperText = "",

    /**
     * Set an id for the input element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Specify the label text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    labelText = "",

    /** Set to `true` to visually hide the label text */
    hideLabel = false,

    /**
     * Specify the max character count allowed for the input.
     * Displays a character counter to the right of the label.
     * @type {number | undefined}
     */
    maxCount = undefined,

    /**
     * Override the counter text read by screen readers.
     * @type {((count: number, max: number) => string) | undefined}
     * @default `${count} of ${max} characters`
     */
    counterText = undefined,

    /**
     * Specify the text announced when the limit is reached.
     * @type {string | undefined}
     * @default "Character limit reached"
     */
    limitReachedText = undefined,

    /** Set to `true` to indicate an invalid state */
    invalid = false,

    /** Specify the invalid state text */
    invalidText = "",

    /** Set to `true` to indicate a warning state */
    warn = false,

    /** Specify the warning state text */
    warnText = "",

    /**
     * Obtain a reference to the input HTML element.
     * @type {null | HTMLInputElement}
     */
    ref = $bindable(null),

    /** Set to `true` to use the inline variant */
    inline = false,

    /** Set to `true` to use the read-only variant */
    readonly = false,

    /**
     * Set to `true` to use the fluid variant.
     * Inherited from the parent `FluidForm` context,
     * so it does not need to be set when used inside `FluidForm`.
     * Cannot be combined with the inline variant.
     */
    fluid = false,

    /** Set to `true` to select the input's text when it receives focus */
    selectTextOnFocus = false,

    /**
     * Called as the user edits the value, with the parsed value: a number,
     * or `null` when empty, for `type="number"`.
     * @type {((detail: { value: null | number | string }) => void) | undefined}
     */
    onvaluechange = undefined,

    /**
     * Called when the user commits the value (the native `change`: blur or
     * Enter after an edit), with the parsed value.
     * @type {((detail: { value: null | number | string }) => void) | undefined}
     */
    onvaluecommit = undefined,

    /**
     * Render an `AILabel` or another decorator at the end of the field.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {string | undefined | null} */
    type = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {import("svelte/elements").FormEventHandler<HTMLInputElement> | undefined | null} */
    oninput = undefined,

    /** @type {import("svelte/elements").FormEventHandler<HTMLInputElement> | undefined | null} */
    onchange = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLInputElement> | undefined | null} */
    onfocus = undefined,

    ...rest
  } = $props();

  import { getContext, onMount, tick, untrack } from "svelte";
  import { writable } from "svelte/store";
  import Decorator from "../AILabel/Decorator.svelte";
  import {
    FORM_CONTEXT_KEY,
    FORM_SIZE_CONTEXT_KEY,
  } from "../constants/context-keys.js";
  import EditOff from "../icons/EditOff.svelte";
  import WarningAltFilled from "../icons/WarningAltFilled.svelte";
  import WarningFilled from "../icons/WarningFilled.svelte";
  import {
    buildFieldIds,
    joinDescribedBy,
    resolveStatusDescribedBy,
    resolveValidationVisibility,
  } from "../utils/field-status.js";
  import { fieldsetDisabled } from "../utils/fieldset-disabled.js";
  import { formReset } from "../utils/form-reset.js";
  import { graphemeCount } from "../utils/grapheme-count.js";
  import { createLimitAnnouncement } from "../utils/limit-announcement.js";
  import { preserveFocusSelection } from "../utils/preserve-focus-selection.js";
  import { FIELD_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";
  import { titleWhenTruncated } from "../utils/title-when-truncated.js";

  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(disabled || inDisabledFieldset);

  const ctx = getContext(FORM_CONTEXT_KEY);
  /** @type {undefined | import("svelte/store").Readable<undefined | "xs" | "sm" | "md" | "xl">} */
  const formSize = getContext(FORM_SIZE_CONTEXT_KEY);
  const effectiveSize = $derived(
    normalizeSize(size ?? $formSize, FIELD_SIZE_ALIASES),
  );

  /**
   * Starts active when a decorator is passed, so the server renders the AI
   * surface. `Decorator` clears it when no `AILabel` claims it.
   * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
   */
  const aiLabelState = writable(untrack(() => decorator) ? "active" : undefined);

  /** @param {string} raw */
  function parse(raw) {
    if (type !== "number") return raw;
    return raw === "" ? null : Number(raw);
  }

  // A form reset restores the field without an input event; read it back.
  function handleFormReset() {
    if (ref) value = parse(ref.value);
  }

  /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleInput(event) {
    value = parse(event.currentTarget.value);
    onvaluechange?.({ value });
    oninput?.(event);
  }

  /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleChange(event) {
    onvaluecommit?.({ value: parse(event.currentTarget.value) });
    onchange?.(event);
  }

  /** @param {FocusEvent & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleFocus(event) {
    onfocus?.(event);
    if (selectTextOnFocus && !effectiveDisabled) {
      tick().then(() => ref?.select());
    }
  }

  const { showInvalid, showWarn } = $derived(
    resolveValidationVisibility({
      invalid,
      warn,
      disabled: effectiveDisabled,
      readonly,
    }),
  );
  const isFluid = $derived(!inline && (fluid || !!ctx?.isFluid));
  const { helperId, errorId, warnId } = $derived(buildFieldIds(id));
  const counterId = $derived(`counter-${id}`);
  const count = $derived(graphemeCount((value ?? "").toString()));
  const resolvedCounterText = $derived(
    counterText ??
      ((/** @type {number} */ c, /** @type {number} */ m) =>
        `${c} of ${m} characters`),
  );
  const resolvedLimitReachedText = $derived(
    limitReachedText ?? "Character limit reached",
  );
  // A snippet label is laid out by the consumer; the fluid label then keeps
  // its natural height instead of truncating.
  const slottedLabel = $derived(typeof labelText === "function");

  const limitAnnouncement = createLimitAnnouncement(
    untrack(() => graphemeCount((value ?? "").toString())),
  );

  onMount(() => limitAnnouncement.cancel);

  $effect.pre(() => {
    limitAnnouncement.track(count, maxCount, resolvedLimitReachedText);
  });

  // NVDA ignores `readonly` on a number input and announces it as editable,
  // so a read-only number field renders as a text input.
  const effectiveType = $derived(readonly && type === "number" ? "text" : type);
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

{#snippet counter()}
  {#if maxCount != null}
    <div
      class={[
        "bx--label",
        effectiveDisabled && "bx--label--disabled",
        "bx--text-input__label-counter",
      ]}
      aria-hidden="true"
    >
      {count}/{maxCount}
    </div>
  {/if}
{/snippet}

<div
  use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
  class={[
    "bx--form-item",
    "bx--text-input-wrapper",
    inline && "bx--text-input-wrapper--inline",
    readonly && "bx--text-input-wrapper--readonly",
    isFluid && "bx--text-input--fluid",
  ]}
>
  {#if inline}
    <div
      class={[
        "bx--text-input__label-helper-wrapper",
        hideLabel && maxCount == null && !helperText && "bx--visually-hidden",
      ]}
    >
      {#if labelText}
        <div class="bx--text-input__label-wrapper">
          <label
            for={id}
            class={[
              "bx--label",
              hideLabel && "bx--visually-hidden",
              effectiveDisabled && "bx--label--disabled",
              "bx--label--inline",
              effectiveSize === "xs" && "bx--label--inline--xs",
              effectiveSize === "sm" && "bx--label--inline--sm",
              effectiveSize === "xl" && "bx--label--inline--xl",
            ]}
          >
            {@render content(labelText)}
          </label>
          {@render counter()}
        </div>
      {/if}
      {#if !isFluid && helperText}
        <div
          id={helperId}
          class={[
            "bx--form__helper-text",
            effectiveDisabled && "bx--form__helper-text--disabled",
            "bx--form__helper-text--inline",
          ]}
        >
          {helperText}
        </div>
      {/if}
    </div>
  {/if}
  {#if !inline && labelText}
    <div class="bx--text-input__label-wrapper">
      <label
        for={id}
        class={[
          "bx--label",
          hideLabel && "bx--visually-hidden",
          effectiveDisabled && "bx--label--disabled",
          isFluid && slottedLabel && "bx--label--slotted",
        ]}
        use:titleWhenTruncated={{ enabled: isFluid && !slottedLabel }}
      >
        {@render content(labelText)}
      </label>
      {@render counter()}
    </div>
  {/if}
  {#if maxCount != null}
    <span id={counterId} class="bx--visually-hidden">
      {resolvedCounterText(count, maxCount)}
    </span>
    <!-- Polite, not assertive like Carbon's, so it never cuts off the
      screen reader's echo of what was just typed. -->
    <div class="bx--visually-hidden" aria-live="polite" aria-atomic="true">
      {$limitAnnouncement}
    </div>
  {/if}
  <div
    class={[
      "bx--text-input__field-outer-wrapper",
      inline && "bx--text-input__field-outer-wrapper--inline",
    ]}
  >
    <div
      data-invalid={showInvalid || undefined}
      data-warn={showWarn || undefined}
      class={[
        "bx--text-input__field-wrapper",
        showWarn && "bx--text-input__field-wrapper--warning",
        decorator && !isFluid && "bx--text-input__field-wrapper--decorator",
        $aiLabelState === "active" && "bx--text-input__field-wrapper--ai-label",
      ]}
    >
      {#if readonly}
        <EditOff class="bx--text-input__readonly-icon" />
      {:else}
        {#if showInvalid}
          <WarningFilled class="bx--text-input__invalid-icon" />
        {/if}
        {#if showWarn}
          <WarningAltFilled
            class="bx--text-input__invalid-icon
            bx--text-input__invalid-icon--warning"
          />
        {/if}
      {/if}
      <input
        bind:this={ref}
        use:preserveFocusSelection={selectTextOnFocus && !effectiveDisabled}
        use:formReset={handleFormReset}
        data-invalid={showInvalid || undefined}
        aria-invalid={showInvalid ? "true" : undefined}
        data-warn={showWarn || undefined}
        aria-errormessage={showInvalid && invalidText ? errorId : undefined}
        disabled={effectiveDisabled}
        {id}
        value={value ?? ""}
        {readonly}
        maxlength={maxCount ?? undefined}
        {...rest}
        type={effectiveType}
        class={[
          "bx--text-input",
          showInvalid && "bx--text-input--invalid",
          showWarn && "bx--text-input--warning",
          effectiveSize === "xs" && "bx--text-input--xs",
          effectiveSize === "sm" && "bx--text-input--sm",
          effectiveSize === "xl" && "bx--text-input--xl",
          className,
        ]}
        aria-describedby={joinDescribedBy(
          resolveStatusDescribedBy({
            showInvalid,
            showWarn,
            invalidText,
            warnText,
            helperText,
            isFluid,
            errorId: errorId ?? "",
            warnId: warnId ?? "",
            helperId,
            includeErrorId: false,
          }),
          maxCount == null ? null : counterId,
          ariaDescribedBy,
        )}
        oninput={handleInput}
        onchange={handleChange}
        onfocus={handleFocus}
      />
      {#if decorator}
        <Decorator
          class="bx--field-decorator bx--text-input__field-inner-wrapper--decorator"
          size={effectiveSize}
          state={aiLabelState}
        >
          {@render decorator()}
        </Decorator>
      {/if}
      {#if isFluid}
        <hr class="bx--text-input__divider" />
      {/if}
      {#if isFluid && showInvalid && invalidText}
        <div class="bx--form-requirement" id={errorId} role="alert">
          {invalidText}
        </div>
      {/if}
      {#if isFluid && showWarn && warnText}
        <div class="bx--form-requirement" id={warnId}>{warnText}</div>
      {/if}
    </div>
    {#if !showInvalid && !showWarn && !isFluid && !inline && helperText}
      <div
        id={helperId}
        class={[
          "bx--form__helper-text",
          effectiveDisabled && "bx--form__helper-text--disabled",
        ]}
      >
        {helperText}
      </div>
    {/if}
    {#if !isFluid && showInvalid && invalidText}
      <div class="bx--form-requirement" id={errorId} role="alert">
        {invalidText}
      </div>
    {/if}
    {#if !isFluid && showWarn && warnText}
      <div class="bx--form-requirement" id={warnId}>{warnText}</div>
    {/if}
  </div>
</div>
