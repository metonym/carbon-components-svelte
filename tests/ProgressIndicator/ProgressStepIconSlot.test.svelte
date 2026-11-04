<script lang="ts">
  import ProgressIndicator from "carbon-components-svelte/ProgressIndicator/ProgressIndicator.svelte";
  import ProgressStep from "carbon-components-svelte/ProgressIndicator/ProgressStep.svelte";
</script>

<ProgressIndicator currentIndex={1}>
  <ProgressStep complete label="Step 1" description="Completed">
    {#snippet icon({ complete, current, invalid })}<span data-testid="icon-1"
        >c:{complete}|cur:{current}|inv:{invalid}</span
      >{/snippet}
  </ProgressStep>
  <ProgressStep label="Step 2" description="Current">
    {#snippet icon({ complete, current, invalid })}<span data-testid="icon-2"
        >c:{complete}|cur:{current}|inv:{invalid}</span
      >{/snippet}
  </ProgressStep>
  <ProgressStep invalid label="Step 3" description="Invalid">
    {#snippet icon({ complete, current, invalid })}<span data-testid="icon-3"
        >c:{complete}|cur:{current}|inv:{invalid}</span
      >{/snippet}
  </ProgressStep>
</ProgressIndicator>
