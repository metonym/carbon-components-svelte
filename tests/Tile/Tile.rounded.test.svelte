<script lang="ts">
  import ClickableTile from "carbon-components-svelte/Tile/ClickableTile.svelte";
  import ExpandableTile from "carbon-components-svelte/Tile/ExpandableTile.svelte";
  import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
  import SelectableTile from "carbon-components-svelte/Tile/SelectableTile.svelte";
  import Tile from "carbon-components-svelte/Tile/Tile.svelte";

  export let rounded = true;
  export let decorated = true;
</script>

{#if decorated}
  <Tile {rounded}>{#snippet decorator()}<span>AI</span>{/snippet}</Tile>
  <ClickableTile href="/details" {rounded}>
    {#snippet decorator()}<span>AI</span>{/snippet}
  </ClickableTile>
  <SelectableTile {rounded}
    >{#snippet decorator()}<span>AI</span>{/snippet}</SelectableTile
  >
  <RadioTile value="a" {rounded}
    >{#snippet decorator()}<span>AI</span>{/snippet}</RadioTile
  >
  <ExpandableTile {rounded}
    >{#snippet decorator()}<span>AI</span>{/snippet}</ExpandableTile
  >
{:else}
  <Tile {rounded} />
  <ClickableTile href="/details" {rounded} />
  <SelectableTile {rounded} />
  <RadioTile value="a" {rounded} />
  <ExpandableTile {rounded} />
{/if}
