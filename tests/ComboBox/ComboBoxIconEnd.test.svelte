<script lang="ts">
  import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

  const items = [
    { id: "0", text: "Slack" },
    { id: "1", text: "Email" },
  ];
</script>

<ComboBox {items} selectedId="0" open labelText="Icon end">
  {#snippet iconEnd({ item, selected })}
    <span data-testid="end-{item.id}" data-selected={selected}>E</span>
  {/snippet}
</ComboBox>
