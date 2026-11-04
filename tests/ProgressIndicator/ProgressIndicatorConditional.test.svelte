<script lang="ts">
  import ProgressIndicator from "carbon-components-svelte/ProgressIndicator/ProgressIndicator.svelte";
  import ProgressStep from "carbon-components-svelte/ProgressIndicator/ProgressStep.svelte";
  import type { ComponentProps } from "svelte";

  export let showOptional = true;
  export let currentIndex = 0;
  export let onchange: ComponentProps<ProgressIndicator>["oncurrentchange"] =
    undefined;
</script>

<ProgressIndicator {currentIndex} oncurrentchange={(e) => onchange?.(e)}>
  <ProgressStep label="Step 1" complete />
  {#if showOptional}
    <ProgressStep label="Optional" complete />
  {/if}
  <ProgressStep label="Step 3" complete />
</ProgressIndicator>
