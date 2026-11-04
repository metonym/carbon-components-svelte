<script lang="ts">
  import ExpandableTile from "carbon-components-svelte/Tile/ExpandableTile.svelte";

  export let hasInteractiveContent: boolean | undefined = undefined;
</script>

<ExpandableTile id="plan" {hasInteractiveContent}>
  {#snippet above()}<div><a href="/plans">Compare plans</a></div>{/snippet}
  {#snippet below()}<div>Billed monthly</div>{/snippet}
</ExpandableTile>
