<script>
  /**
   * @restProps {input}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the toggle size.
     * Also accepts Carbon v11's `"md"` (`"default"`).
     * @type {"default" | "sm" | "md"}
     */
    size = "default",

    /**
     * Set to `true` to toggle the checkbox input.
     * Follows the switch when the owning form resets.
     */
    toggled = $bindable(false),

    /** Set to `true` to disable checkbox input */
    disabled = false,

    /**
     * Specify the text for the untoggled state, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    offText = "Off",

    /**
     * Specify the text for the toggled state, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    onText = "On",

    /**
     * Specify the label text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    labelText = "",

    /** Set to `true` to visually hide the label text */
    hideLabel = false,

    /**
     * Set an id for the input element
     * @type {string}
     */
    id = fallbackId,

    /** Set to `true` to use the read-only variant */
    readonly = false,

    /**
     * Specify the assistive text announced to screen readers when read-only.
     * Exposed because VoiceOver does not announce `aria-readonly`.
     */
    readonlyText = "Read-only",

    /** Set to `true` to indicate an invalid state */
    invalid = false,

    /** Specify the invalid state text */
    invalidText = "",

    /** Set to `true` to indicate a warning state */
    warn = false,

    /** Specify the warning state text */
    warnText = "",

    /** Specify the helper text, shown under the switch */
    helperText = "",

    /**
     * Obtain a reference to the input HTML element.
     * @type {null | HTMLInputElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user toggles the switch.
     * @type {((detail: { toggled: boolean }) => void) | undefined}
     */
    ontoggledchange = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLInputElement> | undefined | null} */
    onclick = undefined,

    /** @type {import("svelte/elements").FormEventHandler<HTMLInputElement> | undefined | null} */
    onchange = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLInputElement> | undefined | null} */
    onkeydown = undefined,

    ...rest
  } = $props();

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

  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(disabled || inDisabledFieldset);

  const { showInvalid, showWarn } = $derived(
    resolveValidationVisibility({
      invalid,
      warn,
      disabled: effectiveDisabled,
      readonly,
    }),
  );
  const { helperId, errorId, readonlyId, warnId } = $derived(
    buildFieldIds(id),
  );

  // A form reset restores the switch without a change event. Read the DOM
  // back, like the other form controls do. A read-only switch keeps its
  // state, so put the switch back instead of following the browser's
  // native-reset default.
  function handleFormReset() {
    if (!ref) return;
    if (readonly) {
      ref.checked = toggled;
      return;
    }
    toggled = ref.checked;
  }

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleClick(event) {
    if (readonly) event.preventDefault();
    onclick?.(event);
  }

  /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleChange(event) {
    if (!readonly) {
      // Read the input, not the Svelte state: the two disagree after a form
      // reset, and inverting stale state would undo the click.
      toggled = event.currentTarget.checked;
      ontoggledchange?.({ toggled });
    }
    onchange?.(event);
  }

  /** @param {KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      // A held key repeats keydown; toggle once per press.
      if (!readonly && !event.repeat) ref?.click();
    }
    onkeydown?.(event);
  }
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<div
  use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
  class={[
    "bx--form-item",
    "bx--form-item--fit",
    readonly && "bx--toggle--readonly",
    showInvalid && "bx--toggle--invalid",
    showWarn && "bx--toggle--warning",
  ]}
  style:user-select="none"
>
  <input
    bind:this={ref}
    use:formReset={handleFormReset}
    role="switch"
    type="checkbox"
    checked={toggled}
    aria-readonly={readonly || undefined}
    aria-invalid={showInvalid || undefined}
    aria-label={ariaLabel}
    aria-describedby={joinDescribedBy(
      readonly ? readonlyId : null,
      resolveStatusDescribedBy({
        showInvalid,
        showWarn,
        helperText,
        invalidText,
        warnText,
        errorId,
        warnId,
        helperId,
      }),
      ariaDescribedBy,
    )}
    disabled={effectiveDisabled}
    {id}
    {...rest}
    class={[
      "bx--toggle-input",
      size === "sm" && "bx--toggle-input--small",
      className,
    ]}
    onclick={handleClick}
    onchange={handleChange}
    onkeydown={handleKeydown}
  />
  <label
    aria-label={labelText || ariaLabel != null ? undefined : "Toggle"}
    for={id}
    class="bx--toggle-input__label"
  >
    {#if labelText}
      <span class={[hideLabel && "bx--visually-hidden"]}>
        {@render content(labelText)}
      </span>
    {/if}
    <span
      class="bx--toggle__switch"
      style:margin-top={hideLabel ? 0 : undefined}
    >
      <!-- The state text is in flow: with none, render no spans, or their
        margin would widen an otherwise bare switch. -->
      {#if offText || onText}
        <span aria-hidden="true" class="bx--toggle__text--off">
          {@render content(offText)}
        </span>
        <span aria-hidden="true" class="bx--toggle__text--on">
          {@render content(onText)}
        </span>
      {/if}
    </span>
  </label>
  {#if readonly}
    <span id={readonlyId} class="bx--visually-hidden">{readonlyText}</span>
  {/if}
  <div class="bx--toggle__validation-msg">
    {#if showInvalid}
      <WarningFilled class="bx--toggle__invalid-icon" />
      {#if invalidText}
        <div id={errorId} class="bx--form-requirement" role="alert">
          {invalidText}
        </div>
      {/if}
    {:else if showWarn}
      <WarningAltFilled
        class="bx--toggle__invalid-icon bx--toggle__invalid-icon--warning"
      />
      {#if warnText}
        <div id={warnId} class="bx--form-requirement">{warnText}</div>
      {/if}
    {/if}
  </div>
  {#if helperText && !showInvalid && !showWarn}
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
</div>
