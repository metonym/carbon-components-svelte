<svelte:options accessors />

<script lang="ts">
  import ExpandableTile from "carbon-components-svelte/Tile/ExpandableTile.svelte";

  export let tileMaxHeight = 100;
  export let tilePadding = 50;
</script>

<ExpandableTile data-testid="bound" bind:tileMaxHeight bind:tilePadding>
  {#snippet above()}<div>Above bound</div>{/snippet}
  {#snippet below()}<div>Below bound</div>{/snippet}
</ExpandableTile>

<!-- Basic expandable tile (no interactive content) -->
<ExpandableTile data-testid="basic">
  {#snippet above()}<div>Above the fold</div>{/snippet}
  {#snippet below()}<div>Below the fold</div>{/snippet}
</ExpandableTile>

<!-- Expandable tile with interactive content (link) in "above" slot -->
<ExpandableTile
  data-testid="interactive"
  id="interactive-tile"
  hasInteractiveContent
>
  {#snippet above()}<div>
      <a href="https://example.com" data-testid="inner-link">Learn more</a>
    </div>{/snippet}
  {#snippet below()}<div>Below the fold</div>{/snippet}
</ExpandableTile>
