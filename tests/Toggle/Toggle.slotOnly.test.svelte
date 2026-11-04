<script lang="ts">
  import Toggle from "carbon-components-svelte/Toggle/Toggle.svelte";
</script>

<Toggle>
  {#snippet labelText()}<span>Slot only label</span>{/snippet}
</Toggle>
