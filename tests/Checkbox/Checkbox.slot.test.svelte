<script lang="ts">
  import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
</script>

<Checkbox data-testid="checkbox-slot">
  {#snippet labelText()}<span data-testid="custom-label">
    Custom label content
  </span>{/snippet}
</Checkbox>
