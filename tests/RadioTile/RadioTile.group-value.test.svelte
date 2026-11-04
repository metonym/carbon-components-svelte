<svelte:options accessors />

<script lang="ts">
  import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
  import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";

  export let selected: string | undefined = undefined;
  export let standardValue = "standard";
  export let onSelect: (value: string | undefined) => void = () => {};
</script>

<TileGroup
  legendText="Plan"
  name="plan"
  bind:selected
  onselectedchange={(e) => onSelect(e.selected)}
>
  <RadioTile value="lite">Lite</RadioTile>
  <RadioTile value={standardValue}>Standard</RadioTile>
  <RadioTile value="plus">Plus</RadioTile>
</TileGroup>
