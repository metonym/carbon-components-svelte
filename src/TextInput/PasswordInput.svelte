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
     * Follows the field when the owning form resets.
     * @type {number | string}
     */
    value = $bindable(""),

    /**
     * Set to `"text"` to toggle the password visibility.
     * @type {"text" | "password"}
     */
    type = $bindable("password"),

    /** Specify the text of the toggle while the password is visible */
    hidePasswordText = "Hide password",

    /** Specify the text of the toggle while the password is hidden */
    showPasswordText = "Show password",

    /**
     * Set the tooltip placement in floating-ui form: the side, then `start`
     * or `end` along it, as Popover's `align` takes. Above and below,
     * `start` and `end` name inline sides, so they swap under `dir="rtl"`.
     * When set, takes precedence over `tooltipPosition` and `tooltipAlignment`.
     * @type {"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end" | undefined}
     */
    tooltipAlign = undefined,

    /**
     * Set the alignment of the tooltip relative to the icon.
     * @deprecated use `tooltipAlign`
     * @type {"start" | "center" | "end"}
     */
    tooltipAlignment = "end",

    /**
     * Set the position of the tooltip relative to the icon.
     * @deprecated use `tooltipAlign`
     * @type {"top" | "right" | "bottom" | "left"}
     */
    tooltipPosition = "bottom",

    /** Set to `true` to disable the input */
    disabled = false,

    /** Specify the helper text */
    helperText = "",

    /**
     * Specify the label text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    labelText = "",

    /** Set to `true` to visually hide the label text */
    hideLabel = false,

    /** Set to `true` to indicate an invalid state */
    invalid = false,

    /** Specify the invalid state text */
    invalidText = "",

    /** Set to `true` to indicate a warning state */
    warn = false,

    /** Specify the warning state text */
    warnText = "",

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

    /**
     * Set an id for the input element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Obtain a reference to the input HTML element.
     * @type {null | HTMLInputElement}
     */
    ref = $bindable(null),

    /**
     * Set to `true` to always render the tooltip in a portal, or `false` to
     * keep it in place. Left unset, the tooltip opens in a portal inside a
     * `Modal`, or when a box around it (`overflow` other than `visible`, such
     * as a `DataTable`) would cut it off.
     * @type {boolean | undefined}
     */
    portalTooltip = undefined,

    /** Set to `true` to select the input's text when it receives focus */
    selectTextOnFocus = false,

    /**
     * Called as the user edits the value.
     * @type {((detail: { value: string }) => void) | undefined}
     */
    onvaluechange = undefined,

    /**
     * Called when the user commits the value (the native `change`).
     * @type {((detail: { value: string }) => void) | undefined}
     */
    onvaluecommit = undefined,

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
  import PortalTooltip from "../Portal/PortalTooltip.svelte";
  import {
    FORM_CONTEXT_KEY,
    FORM_SIZE_CONTEXT_KEY,
    MODAL_CONTEXT_KEY,
  } from "../constants/context-keys.js";
  import EditOff from "../icons/EditOff.svelte";
  import View from "../icons/View.svelte";
  import ViewOff from "../icons/ViewOff.svelte";
  import WarningAltFilled from "../icons/WarningAltFilled.svelte";
  import WarningFilled from "../icons/WarningFilled.svelte";
  import { createAnchoredTooltip } from "../utils/anchored-tooltip.js";
  import {
    buildFieldIds,
    joinDescribedBy,
    resolveStatusDescribedBy,
    resolveValidationVisibility,
  } from "../utils/field-status.js";
  import { fieldsetDisabled } from "../utils/fieldset-disabled.js";
  import { clippedBy } from "../utils/fit-align.js";
  import { formReset } from "../utils/form-reset.js";
  import { preserveFocusSelection } from "../utils/preserve-focus-selection.js";
  import { FIELD_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";
  import { tooltipPlacement } from "../utils/tooltip-align.js";
  import { getTooltipGroup } from "../utils/tooltip-group.js";

  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(disabled || inDisabledFieldset);

  const ctx = getContext(FORM_CONTEXT_KEY);
  /** @type {undefined | import("svelte/store").Readable<undefined | "xs" | "sm" | "md" | "xl">} */
  const formSize = getContext(FORM_SIZE_CONTEXT_KEY);
  const effectiveSize = $derived(
    normalizeSize(size ?? $formSize, FIELD_SIZE_ALIASES),
  );
  const insideModal = getContext(MODAL_CONTEXT_KEY);

  const { showInvalid, showWarn } = $derived(
    resolveValidationVisibility({
      invalid,
      warn,
      disabled: effectiveDisabled,
      readonly,
    }),
  );
  const isFluid = $derived(!inline && (fluid || !!ctx?.isFluid));
  const slottedLabel = $derived(typeof labelText === "function");
  const {
    position: effectiveTooltipPosition,
    alignment: effectiveTooltipAlignment,
  } = $derived(tooltipPlacement(tooltipAlign, tooltipPosition, tooltipAlignment));

  // Set for one open when the in-place tooltip turns out to be cut off by
  // a box around it (a scrolling panel, a DataTable): it shows in a portal
  // instead. Only when `portalTooltip` is left unset.
  let portalWhenClipped = $state(false);
  const effectivePortalTooltip = $derived(
    portalTooltip === undefined
      ? !!insideModal || portalWhenClipped
      : portalTooltip,
  );

  // The position classes place the in-place tooltip and its caret. A
  // portalled one has its own, so the toggle drops them, as Button does.
  const inlinePosition = $derived(
    effectivePortalTooltip ? undefined : effectiveTooltipPosition,
  );
  const inlineAlignment = $derived(
    effectivePortalTooltip ? undefined : effectiveTooltipAlignment,
  );

  /** @type {null | HTMLButtonElement} */
  let toggleButtonRef = $state(null);
  /** @type {null | HTMLSpanElement} */
  let tooltipRef = $state(null);

  // The toggle's tooltip opens without a delay, but still takes the tooltip
  // group's active slot so it never overlaps another tooltip, and skips the
  // fade-in when it takes over from a tooltip in the same group. Escape
  // hides it until the next hover or focus.
  const tooltip = createAnchoredTooltip({
    group: getTooltipGroup(),
    enabled: () => !effectiveDisabled,
    dismissOnClick: false,
    enterDelayMs: () => 0,
  });
  const {
    open: tooltipOpen,
    hidden: tooltipHidden,
    instant: tooltipInstant,
  } = tooltip;

  $effect(() => {
    if (toggleButtonRef) return tooltip.attach(toggleButtonRef);
  });

  $effect(() => {
    if (effectiveDisabled) untrack(() => tooltip.hide());
  });

  $effect(() => {
    if (!$tooltipOpen) portalWhenClipped = false;
  });
  const inlineOpen = $derived(!effectivePortalTooltip && $tooltipOpen);
  // The in-place tooltip is laid out while hidden, so it measures where it
  // shows. Effects run after the update, so the swap lands before paint.
  $effect(() => {
    if (inlineOpen) untrack(portalIfClipped);
  });

  function portalIfClipped() {
    if (portalTooltip !== undefined || !inlineOpen || !tooltipRef) return;
    if (clippedBy(tooltipRef)) portalWhenClipped = true;
  }

  onMount(() => () => tooltip.destroy());

  const { helperId, errorId, warnId } = $derived(buildFieldIds(id));
  const tooltipLabel = $derived(
    type === "text" ? hidePasswordText : showPasswordText,
  );

  /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleInput(event) {
    value = event.currentTarget.value;
    onvaluechange?.({ value });
    oninput?.(event);
  }

  /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleChange(event) {
    onvaluecommit?.({ value: event.currentTarget.value });
    onchange?.(event);
  }

  /** @param {FocusEvent & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleFocus(event) {
    onfocus?.(event);
    if (selectTextOnFocus && !effectiveDisabled) {
      tick().then(() => ref?.select());
    }
  }

  // A form reset restores the field without an input event; read it back.
  function handleFormReset() {
    if (ref) value = ref.value;
  }
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}


<div
  use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
  class:bx--form-item={true}
  class:bx--text-input-wrapper={true}
  class:bx--password-input-wrapper={true}
  class:bx--text-input-wrapper--inline={inline}
  class:bx--text-input-wrapper--readonly={readonly}
  class:bx--text-input--fluid={isFluid}
>
  {#if inline}
    <div
      class:bx--text-input__label-helper-wrapper={true}
      class:bx--visually-hidden={hideLabel && !helperText}
    >
      <label
        for={id}
        class:bx--label={true}
        class:bx--visually-hidden={hideLabel}
        class:bx--label--disabled={effectiveDisabled}
        class:bx--label--inline={inline}
        class:bx--label--inline--xs={inline && effectiveSize === "xs"}
        class:bx--label--inline--sm={inline && effectiveSize === "sm"}
        class:bx--label--inline--xl={inline && effectiveSize === "xl"}
        class:bx--label--slotted={isFluid && slottedLabel}
      >
        {@render content(labelText)}
      </label>
      {#if !isFluid && helperText}
        <div
          id={helperId}
          class:bx--form__helper-text={true}
          class:bx--form__helper-text--disabled={effectiveDisabled}
          class:bx--form__helper-text--inline={inline}
        >
          {helperText}
        </div>
      {/if}
    </div>
  {/if}
  {#if !inline && labelText}
    <label
      for={id}
      class:bx--label={true}
      class:bx--visually-hidden={hideLabel}
      class:bx--label--disabled={effectiveDisabled}
      class:bx--label--inline={inline}
      class:bx--label--inline--xs={inline && effectiveSize === "xs"}
      class:bx--label--inline--sm={inline && effectiveSize === "sm"}
      class:bx--label--inline--xl={inline && effectiveSize === "xl"}
      class:bx--label--slotted={isFluid && slottedLabel}
    >
      {@render content(labelText)}
    </label>
  {/if}
  <div
    class:bx--text-input__field-outer-wrapper={true}
    class:bx--text-input__field-outer-wrapper--inline={inline}
  >
    <div
      class:bx--text-input__field-wrapper={true}
      class:bx--text-input__field-wrapper--warning={showWarn}
      data-invalid={showInvalid || undefined}
      data-warn={showWarn || undefined}
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
        {id}
        value={value ?? ""}
        disabled={effectiveDisabled}
        {readonly}
        {...rest}
        {type}
        class={[
          "bx--text-input",
          "bx--password-input",
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
            errorId,
            warnId,
            helperId,
            includeErrorId: false,
          }),
          ariaDescribedBy,
        )}
        oninput={handleInput}
        onchange={handleChange}
        onfocus={handleFocus}
      />
      {#if isFluid}
        <hr class:bx--text-input__divider={true} />
      {/if}
      {#if isFluid && showInvalid && invalidText}
        <div class:bx--form-requirement={true} id={errorId} role="alert">
          {invalidText}
        </div>
      {/if}
      {#if isFluid && showWarn && warnText}
        <div class:bx--form-requirement={true} id={warnId}>{warnText}</div>
      {/if}
      <button
        bind:this={toggleButtonRef}
        type="button"
        disabled={effectiveDisabled}
        class:bx--text-input--password__visibility__toggle={true}
        class:bx--btn={true}
        class:bx--btn--icon-only={true}
        class:bx--btn--disabled={effectiveDisabled}
        class:bx--tooltip__trigger={true}
        class:bx--tooltip--a11y={true}
        class:bx--tooltip--portal-active={effectivePortalTooltip}
        class:bx--tooltip--top={inlinePosition === "top"}
        class:bx--tooltip--right={inlinePosition === "right"}
        class:bx--tooltip--bottom={inlinePosition === "bottom"}
        class:bx--tooltip--left={inlinePosition === "left"}
        class:bx--tooltip--align-start={inlineAlignment === "start"}
        class:bx--tooltip--align-center={inlineAlignment === "center"}
        class:bx--tooltip--align-end={inlineAlignment === "end"}
        class:bx--tooltip--hidden={!effectivePortalTooltip && $tooltipHidden}
        class:bx--tooltip--visible={inlineOpen}
        class:bx--tooltip--instant={!effectivePortalTooltip && $tooltipInstant}
        aria-label={effectivePortalTooltip || effectiveDisabled
          ? tooltipLabel
          : undefined}
        onclick={() => {
          type = type === "password" ? "text" : "password";
        }}
      >
        {#if !effectiveDisabled && !effectivePortalTooltip}
          <span bind:this={tooltipRef} class:bx--assistive-text={true}>
            {tooltipLabel}
          </span>
        {/if}
        {#if type === "text"}
          <ViewOff class="bx--icon-visibility-off" />
        {:else}
          <View class="bx--icon-visibility-on" />
        {/if}
      </button>
    </div>
    {#if !isFluid && showInvalid && invalidText}
      <div class:bx--form-requirement={true} id={errorId} role="alert">
        {invalidText}
      </div>
    {/if}
    {#if !showInvalid && !showWarn && !isFluid && !inline && helperText}
      <div
        id={helperId}
        class:bx--form__helper-text={true}
        class:bx--form__helper-text--disabled={effectiveDisabled}
        class:bx--form__helper-text--inline={inline}
      >
        {helperText}
      </div>
    {/if}
    {#if !isFluid && showWarn && warnText}
      <div class:bx--form-requirement={true} id={warnId}>{warnText}</div>
    {/if}
  </div>
</div>

{#if effectivePortalTooltip && !effectiveDisabled}
  <PortalTooltip
    anchor={toggleButtonRef}
    direction={effectiveTooltipPosition === "top" ? "top" : "bottom"}
    open={$tooltipOpen}
    text={tooltipLabel}
    on:mouseenter={tooltip.handleTooltipMouseenter}
    on:mouseleave={tooltip.handleTooltipMouseleave}
    on:cover={tooltip.handleTooltipCover}
  />
{/if}
