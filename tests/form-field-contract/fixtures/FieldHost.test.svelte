<script lang="ts">
  import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
  import type { Component } from "svelte";
  import { RUNES_COMPONENTS } from "../runes-components";

  let {
    component,
    fieldProps = {},
    inFluidForm = false,
  }: {
    component: Component<any>;
    fieldProps?: Record<string, unknown>;
    /** Inherit fluid from a FluidForm instead of the `fluid` prop. */
    inFluidForm?: boolean;
  } = $props();

  const Field = $derived(component);
  const runes = $derived(RUNES_COMPONENTS.has(component));
</script>

<!-- The label is always the text "Field": a `labelText` snippet for a runes
  field, the `labelChildren` slot for a legacy one. -->
{#snippet field()}
  {#if runes}
    <Field {...fieldProps}>
      {#snippet labelText()}Field{/snippet}
    </Field>
  {:else}
    <Field {...fieldProps}>
      {#snippet labelChildren()}Field{/snippet}
    </Field>
  {/if}
{/snippet}

{#if inFluidForm}
  <FluidForm>{@render field()}</FluidForm>
{:else}
  {@render field()}
{/if}
