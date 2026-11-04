<script lang="ts">
  import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";

  const items = [
    { id: "0", text: "Slack" },
    { id: "1", text: "Email" },
  ];
</script>

<Dropdown {items} selectedId="0" open labelText="Icon end">
  {#snippet iconEnd({ item, selected })}
    <span data-testid="end-{item.id}" data-selected={selected}>E</span>
  {/snippet}
</Dropdown>
