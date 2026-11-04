<script lang="ts">
  import type { MultiSelectItem } from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";
  import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

  const items: MultiSelectItem[] = [
    { id: "0", text: "Option 1" },
    { id: "1", text: "Option 2" },
  ];
</script>

<MultiSelect {items}>
  {#snippet labelText()}<span>Custom label content</span>{/snippet}
</MultiSelect>
