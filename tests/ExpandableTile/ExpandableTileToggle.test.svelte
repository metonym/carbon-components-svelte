<script lang="ts">
  import ExpandableTile from "carbon-components-svelte/Tile/ExpandableTile.svelte";

  export let interactive = false;
</script>

<ExpandableTile data-testid="toggle" hasInteractiveContent={interactive}>
  {#snippet above()}<div>Above the fold</div>{/snippet}
  {#snippet below()}<div>Below the fold</div>{/snippet}
</ExpandableTile>
