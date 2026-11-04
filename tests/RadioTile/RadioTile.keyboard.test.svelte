<script lang="ts">
  import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";
  import TileGroup from "carbon-components-svelte/Tile/TileGroup.svelte";
  import type { ComponentProps } from "svelte";

  export let selected: ComponentProps<TileGroup>["selected"] = "a";
  export let onSelect: (value: string | undefined) => void = () => {};
  export let onChange: (event: Event) => void = () => {};
  export let onSubmit: (event: SubmitEvent) => void = () => {};
</script>

<form data-testid="form" on:submit|preventDefault={onSubmit}>
  <TileGroup
    bind:selected
    legendText="Pick one"
    onselectedchange={(e) => onSelect(e.selected)}
  >
    <RadioTile value="a" onchange={onChange}>A</RadioTile>
    <RadioTile value="b" onchange={onChange}>B</RadioTile>
  </TileGroup>
  <button type="submit">Submit</button>
</form>
<p data-testid="bound">{String(selected)}</p>
