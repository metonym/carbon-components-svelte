<svelte:options accessors />

<script lang="ts">
  import Toggle from "carbon-components-svelte/Toggle/Toggle.svelte";
  import type { ComponentProps } from "svelte";

  let toggled = false;
  let initialToggled = true;
  export let ref: ComponentProps<Toggle>["ref"] = null;
  export let onToggle: (toggled: boolean) => void = () => {};
  export let onChange: (checked: boolean) => void = () => {};
  export let onFocus: () => void = () => {};
  export let onBlur: () => void = () => {};
  export let onClick: () => void = () => {};
</script>

<Toggle
  bind:toggled
  bind:ref
  labelText="Default toggle"
  ontoggledchange={(e) => onToggle(e.toggled)}
  onchange={(e) => {
    if (e.target instanceof HTMLInputElement) onChange(e.target.checked);
  }}
/>

<Toggle labelText="Custom labels" offText="Inactive" onText="Active" />

<Toggle size="sm" labelText="Small toggle" />

<Toggle disabled labelText="Disabled toggle" />

<Toggle
  hideLabel
  labelText="Hidden label toggle"
  aria-label="Hidden label toggle"
/>

<Toggle
  bind:toggled={initialToggled}
  labelText="Initial toggled state"
  name="test-toggle"
/>

<Toggle
  labelText="Events toggle"
  onfocus={onFocus}
  onblur={onBlur}
  onclick={onClick}
/>

<Toggle class="custom-class" labelText="Custom class toggle" />

<Toggle>
  {#snippet labelText()}<span>Label slot</span>{/snippet}
  {#snippet offText()}<span>Off slot</span>{/snippet}
  {#snippet onText()}<span>On slot</span>{/snippet}
</Toggle>
