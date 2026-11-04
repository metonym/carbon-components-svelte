<script lang="ts">
  import ToggleSkeleton from "carbon-components-svelte/Toggle/ToggleSkeleton.svelte";
</script>

<ToggleSkeleton>
  {#snippet labelText()}<span>Custom label content</span>{/snippet}
</ToggleSkeleton>
