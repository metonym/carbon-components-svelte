<svelte:options accessors />

<script lang="ts">
  import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";

  export let checkedA = false;
  export let checkedB = false;
  export let checkedSolo = false;
  export let onCheckedA: (detail: { checked: boolean }) => void = () => {};
  export let onCheckedB: (detail: { checked: boolean }) => void = () => {};
</script>

<form data-testid="form">
  <RadioTile
    value="a"
    name="plan"
    bind:checked={checkedA}
    oncheckedchange={onCheckedA}>A</RadioTile
  >
  <RadioTile
    value="b"
    name="plan"
    bind:checked={checkedB}
    oncheckedchange={onCheckedB}>B</RadioTile
  >
  <RadioTile value="solo" bind:checked={checkedSolo}>Solo</RadioTile>
</form>
