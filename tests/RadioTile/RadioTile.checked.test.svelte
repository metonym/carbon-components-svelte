<svelte:options accessors />

<script lang="ts">
  import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
  import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";
  import type { ComponentProps } from "svelte";

  export let selected: ComponentProps<TileGroup>["selected"] = "a";
  export let checkedB = false;
  export let onSelect: (value: string | undefined) => void = () => {};
</script>

<TileGroup
  bind:selected
  legendText="Pick one"
  onselectedchange={(e) => onSelect(e.selected)}
>
  <RadioTile value="a">A</RadioTile>
  <RadioTile value="b" bind:checked={checkedB}>B</RadioTile>
</TileGroup>
