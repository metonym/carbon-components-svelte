<script lang="ts">
  import RadioTile from "carbon-components-svelte/Tile/RadioTile.svelte";

  export let onFocus: (e: FocusEvent) => void = () => {};
  export let onBlur: (e: FocusEvent) => void = () => {};
</script>

<RadioTile value="standard" onfocus={onFocus} onblur={onBlur}>
  Standard
</RadioTile>
