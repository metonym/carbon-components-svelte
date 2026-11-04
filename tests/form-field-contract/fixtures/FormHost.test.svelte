<script lang="ts">
  import type { ComponentType } from "svelte";
  import { RUNES_COMPONENTS } from "../runes-components";

  export let component: ComponentType;
  export let fieldProps: Record<string, unknown> = {};
  export let value: unknown = "";
  export let onInput: () => void = () => {};
  export let onChange: () => void = () => {};
  export let onClear: () => void = () => {};

  // A runes field's native `input` and `change` reach its element through
  // rest props, not `on:` forwarding.
  $: nativeHandlers = RUNES_COMPONENTS.has(component)
    ? { oninput: onInput, onchange: onChange }
    : {};
</script>

<form data-testid="form">
  <svelte:component
    this={component}
    bind:value
    name="field"
    labelText="Field"
    {...fieldProps}
    {...nativeHandlers}
    onvaluechange={onInput}
    onvaluecommit={onChange}
    oninput={onInput}
    onclear={onClear}
    on:input={onInput}
    on:change={onChange}
    on:clear={onClear}
  >
    <svelte:fragment slot="labelChildren">Field</svelte:fragment>
  </svelte:component>
</form>
<p data-testid="bound">{String(value)}</p>
