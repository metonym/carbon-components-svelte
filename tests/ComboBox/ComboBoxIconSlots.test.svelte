<script lang="ts">
  import type { ComboBoxItem } from "carbon-components-svelte/ComboBox/ComboBox.svelte";
  import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";
  import Edit from "carbon-icons-svelte/lib/Edit.svelte";

  const items: ComboBoxItem[] = [
    { id: "0", text: "Slack", icon: Edit },
    { id: "1", text: "Email" },
  ];
</script>

<ComboBox {items} selectedId="0" open labelText="Icon slots">
  {#snippet icon({ item })}
    <span data-testid="left-{item.id}">L</span>
  {/snippet}
  {#snippet iconEnd({ item, selected })}
    <span data-testid="right-{item.id}" data-selected={selected}>R</span>
  {/snippet}
</ComboBox>
