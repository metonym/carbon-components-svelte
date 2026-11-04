<svelte:options accessors />

<script lang="ts">
  import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";

  export let checked = false;
  export let onCheck: (checked: boolean) => void = () => {};
</script>

<Checkbox
  bind:checked
  labelText="Reactive bind test"
  data-testid="checkbox-reactive"
  oncheckedchange={(e) => onCheck(e.checked)}
/>
