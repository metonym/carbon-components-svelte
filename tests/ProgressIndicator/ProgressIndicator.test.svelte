<script lang="ts">
  import ProgressIndicator from "carbon-components-svelte/ProgressIndicator/ProgressIndicator.svelte";
  import ProgressStep from "carbon-components-svelte/ProgressIndicator/ProgressStep.svelte";
  import type { ComponentProps } from "svelte";

  export let currentIndex = 0;
  export let vertical = false;
  export let spaceEqually = false;
  export let preventChangeOnClick = false;
  export let steps: Array<{
    label: string;
    description: string;
    complete: boolean;
    invalid?: boolean;
    disabled?: boolean;
  }> = [];
  export let onchange: ComponentProps<ProgressIndicator>["oncurrentchange"] =
    undefined;
  export let onfocus: ((label: string) => void) | undefined = undefined;
  export let onblur: ((label: string) => void) | undefined = undefined;
</script>

<ProgressIndicator
  {currentIndex}
  {vertical}
  {spaceEqually}
  {preventChangeOnClick}
  oncurrentchange={(e) => onchange?.(e)}
>
  {#each steps as step (step.label)}
    <ProgressStep
      label={step.label}
      description={step.description}
      complete={step.complete}
      invalid={step.invalid}
      disabled={step.disabled}
      onfocus={() => onfocus?.(step.label)}
      onblur={() => onblur?.(step.label)}
    />
  {/each}
</ProgressIndicator>
