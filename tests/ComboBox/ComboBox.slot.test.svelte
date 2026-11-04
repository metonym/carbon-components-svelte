<script lang="ts">
  import type { ComboBoxItem } from "carbon-components-svelte/ComboBox/ComboBox.svelte";
  import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

  const items: ComboBoxItem[] = [
    { id: "0", text: "Option 1" },
    { id: "1", text: "Option 2" },
  ];
</script>

<ComboBox {items}>
  {#snippet labelText()}<span>Custom label content</span>{/snippet}
</ComboBox>
