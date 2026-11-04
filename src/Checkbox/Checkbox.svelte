<script>
  /**
   * @template [T=any]
   * @restProps {input}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the value of the checkbox.
     * Submitted as `"on"` when empty, like a native checkbox.
     * @type {T}
     */
    value = /** @type {T} */ (""),

    /**
     * Specify whether the checkbox is checked.
     * Follows the box when the owning form resets. Inside a
     * `CheckboxGroup` or with `group`, the group decides instead.
     */
    checked = $bindable(false),

    /**
     * Specify the bound group.
     * @type {ReadonlyArray<T> | undefined}
     */
    group = $bindable(undefined),

    /** Specify whether the checkbox is indeterminate. */
    indeterminate = $bindable(false),

    /** Set to `true` to display the skeleton state */
    skeleton = false,

    /** Set to `true` to mark the field as required */
    required = false,

    /** Set to `true` for the checkbox to be read-only */
    readonly = false,

    /**
     * Specify the assistive text announced to screen readers when read-only.
     * Exposed because VoiceOver does not announce `aria-readonly`.
     */
    readonlyText = "Read-only",

    /** Set to `true` to disable the checkbox */
    disabled = false,

    /**
     * Specify the label text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    labelText = "",

    /** Set to `true` to visually hide the label text */
    hideLabel = false,

    /**
     * Set to `true` to omit the outer margin that spaces a stack of
     * checkboxes, as when the checkbox sits in a table cell or a row
     * that spaces its own content.
     */
    noMargin = false,

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

    /** Set a name for the input element */
    name = "",

    /**
     * Specify the id of a form element outside the component to associate
     * the checkbox with.
     * @type {string | undefined}
     */
    form = undefined,

    /**
     * Set the native `title` attribute on the label element. When unset,
     * the label takes its full text as `title` while it is truncated.
     * @type {string | undefined}
     */
    title = undefined,

    /**
     * Set an id for the input label
     * @type {string}
     */
    id = fallbackId,

    /**
     * Set to `true` to hide the input from the accessibility tree via CSS
     * (not just tabindex/aria-hidden, which axe-core's nested-interactive
     * check does not treat as sufficient). Use when this Checkbox is
     * nested inside another interactive/widget-role element that already
     * owns the checked-state semantics (e.g. a listbox option) and the
     * checkbox itself is purely decorative.
     */
    decorative = false,

    /**
     * Obtain a reference to the input HTML element.
     * @type {null | HTMLInputElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user checks or unchecks the box.
     * @type {((detail: { checked: boolean }) => void) | undefined}
     */
    oncheckedchange = undefined,

    /**
     * Render an AI label or other decorator beside the label.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLInputElement> | undefined | null} */
    onclick = undefined,

    /** @type {import("svelte/elements").FormEventHandler<HTMLInputElement> | undefined | null} */
    onchange = undefined,

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
  import { formReset } from "../utils/form-reset.js";
  import { overflowTitle } from "../utils/overflow-title.js";
  import CheckboxSkeleton from "./CheckboxSkeleton.svelte";
  import {
    getCheckboxGroup,
    hasCheckboxGroup,
  } from "./checkbox-group-context.js";

  const ctx = hasCheckboxGroup() ? getCheckboxGroup() : undefined;

  // A disabled `<fieldset>` around the component disables it too.
  let inDisabledFieldset = $state(false);
  const effectiveDisabled = $derived(disabled || inDisabledFieldset);

  const useGroup = $derived(!ctx && Array.isArray(group));
  // Inside a group, the group's selection decides; `checked` is left alone.
  const isChecked = $derived(
    ctx
      ? ctx.selected.includes(value)
      : useGroup
        ? /** @type {ReadonlyArray<T>} */ (group).includes(value)
        : checked,
  );
  // A native checkbox with no value submits "on"; `""` would post an empty,
  // falsy field for a checked box. Only the DOM attribute is mapped; group
  // membership still compares `value` itself.
  const nativeValue = $derived(value === "" || value == null ? "on" : value);

  const effectiveName = $derived(ctx ? (ctx.name ?? name) : name);
  // Native validation requires every `required` checkbox. A required group
  // needs only one, so require every box until one is checked.
  const effectiveRequired = $derived(
    ctx
      ? ctx.required
        ? ctx.selected.length === 0
        : (ctx.required ?? required)
      : required,
  );
  const effectiveReadonly = $derived(!!ctx?.readonly || readonly);
  const { showInvalid, showWarn } = $derived(
    resolveValidationVisibility({
      invalid: !!ctx?.invalid || invalid,
      warn: !!ctx?.warn || warn,
      // A disabled group disables its boxes natively, through `<fieldset
      // disabled>`, so its state is read here only to hide the invalid state.
      disabled: effectiveDisabled || !!ctx?.disabled,
      readonly: effectiveReadonly,
    }),
  );
  const { helperId, errorId, warnId, readonlyId } = $derived(buildFieldIds(id));
  // A decorative checkbox's owner (e.g. a MultiSelect option) already
  // announces read-only, so skip the per-checkbox description.
  const describeReadonly = $derived(effectiveReadonly && !decorative);

  /** @type {null | HTMLSpanElement} */
  let labelRef = $state(null);

  /**
   * Route a change to whatever owns the checked state.
   * @param {boolean} nextChecked
   * @param {boolean} fromReset
   */
  function commit(nextChecked, fromReset) {
    if (ctx) {
      ctx.toggle(value, nextChecked, fromReset);
    } else if (useGroup) {
      const current = /** @type {ReadonlyArray<T>} */ (group);
      const has = current.includes(value);
      if (nextChecked && !has) group = [...current, value];
      else if (!nextChecked && has) group = current.filter((v) => v !== value);
    } else {
      checked = nextChecked;
    }
  }

  // A form reset restores the box without a change event. Sync the state to
  // it, like the other form controls, and call no callback. A read-only
  // checkbox keeps its state, so put the box back instead. So does a
  // decorative one: its owner (a tree node, a listbox option) holds the
  // state and never learns about the reset.
  function handleFormReset() {
    if (!ref) return;
    if (effectiveReadonly || decorative) {
      ref.checked = isChecked;
      return;
    }
    commit(ref.checked, true);
  }

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleClick(event) {
    if (effectiveReadonly) event.preventDefault();
    onclick?.(event);
  }

  /** @param {Event & { currentTarget: EventTarget & HTMLInputElement }} event */
  function handleChange(event) {
    if (effectiveReadonly) return;
    // Read the input, not the Svelte state: the two disagree after a
    // form reset, and inverting stale state would undo the click.
    const nextChecked = event.currentTarget.checked;
    commit(nextChecked, false);
    oncheckedchange?.({ checked: nextChecked });
    onchange?.(event);
  }

  /** @type {import("svelte/store").Writable<undefined | "active" | "revert">} */
  const aiLabelState = writable(undefined);

  /** @param {"default" | "inline"} kind */
  function labelSizeForKind(kind) {
    return kind === "inline" ? "md" : "mini";
  }
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

{#if skeleton}
  <CheckboxSkeleton {...rest} class={className} />
{:else}
  <div
    class={[
      "bx--form-item",
      "bx--form-item--fit",
      "bx--checkbox-wrapper",
      noMargin && "bx--checkbox-wrapper--no-margin",
      effectiveReadonly && "bx--checkbox-wrapper--readonly",
      showInvalid && "bx--checkbox-wrapper--invalid",
      showWarn && "bx--checkbox-wrapper--warning",
      decorator && "bx--checkbox-wrapper--decorator",
    ]}
  >
    <input
      use:fieldsetDisabled={(value) => (inDisabledFieldset = value)}
      bind:this={ref}
      use:formReset={handleFormReset}
      type="checkbox"
      value={nativeValue}
      checked={isChecked}
      {disabled}
      {id}
      style:display={decorative ? "none" : undefined}
      bind:indeterminate
      name={effectiveName}
      form={ctx?.form ?? form}
      required={effectiveRequired}
      aria-readonly={effectiveReadonly || undefined}
      aria-invalid={showInvalid || undefined}
      data-invalid={showInvalid || undefined}
      aria-describedby={joinDescribedBy(
        describeReadonly ? readonlyId : null,
        resolveStatusDescribedBy({
          showInvalid,
          showWarn,
          invalidText,
          warnText,
          helperText,
          errorId: errorId ?? "",
          warnId: warnId ?? "",
          helperId,
        }),
        ariaDescribedBy,
      )}
      {...rest}
      class={["bx--checkbox", className]}
      onclick={handleClick}
      onchange={handleChange}
    />
    <label
      for={id}
      use:overflowTitle={{ title, measure: labelRef }}
      data-contained-checkbox-state={indeterminate ? "mixed" : undefined}
      data-contained-checkbox-disabled={indeterminate && effectiveDisabled
        ? "true"
        : undefined}
      class="bx--checkbox-label"
    >
      <span
        bind:this={labelRef}
        class={["bx--checkbox-label-text", hideLabel && "bx--visually-hidden"]}
      >
        {@render content(labelText)}
      </span>
    </label>
    {#if decorator}
      <Decorator
        class="bx--checkbox-wrapper-inner--decorator"
        state={aiLabelState}
        labelSize={labelSizeForKind}
        labelAlign="start"
      >
        {@render decorator()}
      </Decorator>
    {/if}
    {#if describeReadonly}
      <span id={readonlyId} class="bx--visually-hidden">{readonlyText}</span>
    {/if}
    <!-- Hidden by CSS unless invalid or warning, so only built then. -->
    {#if showInvalid || showWarn}
      <div class="bx--checkbox__validation-msg">
        {#if showInvalid}
          <WarningFilled class="bx--checkbox__invalid-icon" />
          {#if invalidText}
            <div id={errorId} class="bx--form-requirement" role="alert">
              {invalidText}
            </div>
          {/if}
        {:else}
          <WarningAltFilled
            class="bx--checkbox__invalid-icon bx--checkbox__invalid-icon--warning"
          />
          {#if warnText}
            <div id={warnId} class="bx--form-requirement">{warnText}</div>
          {/if}
        {/if}
      </div>
    {/if}
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
{/if}
