<script lang="ts">
  import SelectableTile from "carbon-components-svelte/Tile/SelectableTile.svelte";
  import SelectableTileGroup from "carbon-components-svelte/Tile/SelectableTileGroup.svelte";

  export let selected: string[] = [];
  export let standaloneSelected = false;
  export let onEvent: (detail: unknown) => void = () => {};
</script>

<form data-testid="form">
  <SelectableTileGroup
    bind:selected
    name="regions"
    legendText="Regions"
    onselectedchange={onEvent}
  >
    <SelectableTile value="a" data-testid="tile-a">A</SelectableTile>
    <SelectableTile value="b" data-testid="tile-b">B</SelectableTile>
  </SelectableTileGroup>
  <SelectableTile
    bind:selected={standaloneSelected}
    value="solo"
    name="solo"
    data-testid="tile-solo"
    onselectedchange={onEvent}
  >
    Solo
  </SelectableTile>
</form>
<p data-testid="bound">{selected.join(",")}</p>
<p data-testid="bound-standalone">{String(standaloneSelected)}</p>
