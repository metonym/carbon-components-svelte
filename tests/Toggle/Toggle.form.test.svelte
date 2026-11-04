<script lang="ts">
  import Toggle from "carbon-components-svelte/Toggle/Toggle.svelte";
  import type { ComponentProps } from "svelte";

  export let toggled: ComponentProps<Toggle>["toggled"] = false;
  export let readonly: ComponentProps<Toggle>["readonly"] = false;
  export let value: ComponentProps<Toggle>["value"] = undefined;
  export let onToggle: (detail: { toggled: boolean }) => void = () => {};
</script>

<form data-testid="form">
  <Toggle
    bind:toggled
    {readonly}
    {value}
    name="notify"
    labelText="Notify"
    ontoggledchange={onToggle}
  />
</form>
<p data-testid="bound">{String(toggled)}</p>
