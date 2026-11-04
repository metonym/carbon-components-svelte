<script lang="ts">
  import PageHeader from "carbon-components-svelte/PageHeader/PageHeader.svelte";
</script>

<PageHeader data-testid="slotted">
  {#snippet titleText()}
    Databases <span data-testid="count">(4)</span>
  {/snippet}
</PageHeader>

<PageHeader data-testid="slot-only">
  {#snippet titleText()}Slot only{/snippet}
</PageHeader>

<PageHeader data-testid="start-only">
  {#snippet titleStart()}<span data-testid="start">Start</span>{/snippet}
</PageHeader>

<PageHeader data-testid="end-only">
  {#snippet titleEnd()}<span data-testid="end">End</span>{/snippet}
</PageHeader>
