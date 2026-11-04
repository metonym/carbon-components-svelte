<script>
  /**
   * @restProps {fieldset}
   * @template {string | number} [Value=string | number]
   */

  const fallbackId = $props.id();

  let {
    /**
     * Set the selected checkbox values.
     * @type {ReadonlyArray<Value>}
     */
    selected = $bindable([]),

    /** Set to `true` to disable all checkboxes */
    disabled = false,

    /**
     * Set to `true` to require at least one selection.
     * @type {boolean | undefined}
     */
    required = undefined,

    /**
     * Specify a name attribute for the checkbox inputs.
     * @type {string | undefined}
     */
    name = undefined,

    /**
     * Specify the id of a form element outside the component to associate
     * the fieldset and checkbox inputs with. Overrides each checkbox's own `form`.
     * @type {string | undefined}
     */
    form = undefined,

    /**
     * Specify the legend text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    legendText = "",

    /** Set to `true` to visually hide the legend */
    hideLegend = false,

    /**
     * Specify the orientation of the checkboxes.
     * `"horizontal"` lays them out in a wrapping row, each sized to its label.
     * @type {"vertical" | "horizontal"}
     */
    orientation = "vertical",

    /** Specify the helper text */
    helperText = "",

    /** Set to `true` to indicate an invalid state */
    invalid = false,

    /** Specify the invalid state text */
    invalidText = "",

    /** Set to `true` to indicate a warning state */
    warn = false,

    /** Specify the warning state text */
    warnText = "",

    /** Set to `true` to use the read-only variant */
    readonly = false,

    /**
     * Specify the assistive text announced to screen readers when read-only.
     * Exposed because VoiceOver does not announce `aria-readonly`.
     */
    readonlyText = "Read-only",

    /**
     * Set an id for the container div element.
     * @type {string | undefined}
     */
    id = undefined,

    /**
     * Called when the user checks or unchecks a box in the group.
     * @type {((detail: { selected: ReadonlyArray<Value> }) => void) | undefined}
     */
    onselectedchange = undefined,

    /**
     * The checkboxes.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * Render an AI label or other decorator beside the legend.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    ...rest
  } = $props();

  import { writable } from "svelte/store";
  import Decorator from "../AILabel/Decorator.svelte";
  import WarningAltFilled from "../icons/WarningAltFilled.svelte";
  import WarningFilled from "../icons/WarningFilled.svelte";
  import {
    buildFieldIds,
    joinDescribedBy,
    resolveStatusDescribedBy,
    resolveValidationVisibility,
  } from "../utils/field-status.js";
  import { fieldsetDisabled } from "../utils/fieldset-disabled.js";
  import { setCheckboxGroup } from "./checkbox-group-context.js";

  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(disabled || inDisabledFieldset);

  /**
   * @param {Value} value
   * @param {boolean} checked
   * @param {boolean} [fromReset] A form reset fires no callback, like the
   *   other form controls.
   */
  function toggle(value, checked, fromReset = false) {
    if (readonly) return;
    const has = selected.includes(value);
    if (checked === has) return;
    selected = checked
      ? [...selected, value]
      : selected.filter((v) => v !== value);
    if (!fromReset) onselectedchange?.({ selected });
  }

  setCheckboxGroup({
    get selected() {
      return selected;
    },
    get name() {
      return name;
    },
    get form() {
      return form;
    },
    get required() {
      return required;
    },
    get readonly() {
      return readonly;
    },
    get disabled() {
      return effectiveDisabled;
    },
    get invalid() {
      return invalid;
    },
    get warn() {
      return warn;
    },
    toggle,
  });

  const { showInvalid, showWarn } = $derived(
    resolveValidationVisibility({
      invalid,
      warn,
      disabled: effectiveDisabled,
      readonly,
    }),
  );

  const { helperId, errorId, warnId, readonlyId } = $derived(
    buildFieldIds(id ?? fallbackId),
  );

  /** @type {import("svelte/store").Writable<undefined | "active" | "revert">} */
  const aiLabelState = writable(undefined);
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ value)}
  {#if typeof value === "function"}{@render value()}{:else}{value}{/if}
{/snippet}

<div
  use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
  {id}
  class="bx--form-item"
>
  <fieldset
    {form}
    disabled={effectiveDisabled}
    data-invalid={showInvalid || undefined}
    {...rest}
    aria-describedby={joinDescribedBy(
      readonly ? readonlyId : null,
      resolveStatusDescribedBy({
        showInvalid,
        showWarn,
        invalidText,
        warnText,
        helperText,
        errorId,
        warnId,
        helperId,
      }),
      ariaDescribedBy,
    )}
    class={[
      "bx--checkbox-group",
      orientation === "horizontal" && "bx--checkbox-group--horizontal",
      readonly && "bx--checkbox-group--readonly",
      showInvalid && "bx--checkbox-group--invalid",
      showWarn && "bx--checkbox-group--warning",
      decorator && "bx--checkbox-group--decorator",
      className,
    ]}
  >
    {#if legendText}
      <legend class={["bx--label", hideLegend && "bx--visually-hidden"]}>
        {@render content(legendText)}
      </legend>
    {/if}
    {#if decorator}
      <Decorator
        class="bx--checkbox-group-inner--decorator"
        state={aiLabelState}
        labelKind="default"
        labelAlign="start"
      >
        {@render decorator()}
      </Decorator>
    {/if}
    {@render children?.()}
    <div class="bx--checkbox-group__validation-msg">
      {#if showInvalid}
        <WarningFilled class="bx--checkbox__invalid-icon" />
        {#if invalidText}
          <div id={errorId} class="bx--form-requirement" role="alert">
            {invalidText}
          </div>
        {/if}
      {:else if showWarn}
        <WarningAltFilled
          class="bx--checkbox__invalid-icon bx--checkbox__invalid-icon--warning"
        />
        {#if warnText}
          <div id={warnId} class="bx--form-requirement">{warnText}</div>
        {/if}
      {/if}
    </div>
    {#if readonly}
      <span id={readonlyId} class="bx--visually-hidden">{readonlyText}</span>
    {/if}
  </fieldset>
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
