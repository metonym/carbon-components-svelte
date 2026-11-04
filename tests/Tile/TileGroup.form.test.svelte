<script lang="ts">
  import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
  import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";
  import type { ComponentProps } from "svelte";

  export let selected: ComponentProps<TileGroup>["selected"] = undefined;
  export let values = ["a", "b"];
  export let onSelect: (value: string | undefined) => void = () => {};
</script>

<form data-testid="form">
  <TileGroup
    bind:selected
    legendText="Pick one"
    onselectedchange={(e) => onSelect(e.selected)}
  >
    <RadioTile value={values[0]}>A</RadioTile>
    <RadioTile value={values[1]}>B</RadioTile>
  </TileGroup>
</form>
<p data-testid="bound">{String(selected)}</p>
