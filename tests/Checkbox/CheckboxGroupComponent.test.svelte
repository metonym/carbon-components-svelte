<svelte:options accessors />

<script lang="ts">
  import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
  import CheckboxGroup from "carbon-components-svelte/Checkbox/CheckboxGroup.svelte";
  import type { ComponentProps } from "svelte";

  export let selected: ComponentProps<CheckboxGroup>["selected"] = [];
  export let disabled: ComponentProps<CheckboxGroup>["disabled"] = false;
  export let required: ComponentProps<CheckboxGroup>["required"] = undefined;
  export let name: ComponentProps<CheckboxGroup>["name"] = undefined;
  export let legendText: ComponentProps<CheckboxGroup>["legendText"] = "";
  export let helperText: ComponentProps<CheckboxGroup>["helperText"] = "";
  export let invalid: ComponentProps<CheckboxGroup>["invalid"] = false;
  export let invalidText: ComponentProps<CheckboxGroup>["invalidText"] = "";
  export let warn: ComponentProps<CheckboxGroup>["warn"] = false;
  export let warnText: ComponentProps<CheckboxGroup>["warnText"] = "";
  export let id: ComponentProps<CheckboxGroup>["id"] = undefined;
  export let readonly: ComponentProps<CheckboxGroup>["readonly"] = false;
  export let orientation: ComponentProps<CheckboxGroup>["orientation"] =
    undefined;
  export let customClass = "";
  export let useSlot = false;
  export let onChange: (
    selected: ReadonlyArray<string | number>,
  ) => void = () => {};
  export let onCheck: (value: string, checked: boolean) => void = () => {};
</script>

{#if useSlot}
  <CheckboxGroup
    bind:selected
    {disabled}
    {required}
    {name}
    {id}
    {helperText}
    {invalid}
    {invalidText}
    {warn}
    {warnText}
    {readonly}
    {orientation}
    class={customClass}
    onselectedchange={(e) => onChange(e.selected)}
  >
    {#snippet legendText()}<span>Custom Legend</span>{/snippet}
    <Checkbox
      value="1"
      labelText="Option 1"
      oncheckedchange={(e) => onCheck("1", e.checked)}
    />
    <Checkbox
      value="2"
      labelText="Option 2"
      oncheckedchange={(e) => onCheck("2", e.checked)}
    />
    <Checkbox
      value="3"
      labelText="Option 3"
      oncheckedchange={(e) => onCheck("3", e.checked)}
    />
  </CheckboxGroup>
{:else}
  <CheckboxGroup
    bind:selected
    {disabled}
    {required}
    {name}
    {legendText}
    {id}
    {helperText}
    {invalid}
    {invalidText}
    {warn}
    {warnText}
    {readonly}
    {orientation}
    class={customClass}
    onselectedchange={(e) => onChange(e.selected)}
  >
    <Checkbox
      value="1"
      labelText="Option 1"
      oncheckedchange={(e) => onCheck("1", e.checked)}
    />
    <Checkbox
      value="2"
      labelText="Option 2"
      oncheckedchange={(e) => onCheck("2", e.checked)}
    />
    <Checkbox
      value="3"
      labelText="Option 3"
      oncheckedchange={(e) => onCheck("3", e.checked)}
    />
  </CheckboxGroup>
{/if}
