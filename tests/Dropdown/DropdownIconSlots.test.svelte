<script lang="ts">
  import type { DropdownItem } from "carbon-components-svelte/Dropdown/Dropdown.svelte";
  import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";
  import Edit from "carbon-icons-svelte/lib/Edit.svelte";

  /** Give every item its own `icon`, which the `icon` slot must override. */
  export let withItemIcons = false;

  $: items = [
    { id: "0", text: "Slack" },
    { id: "1", text: "Email" },
  ].map((item): DropdownItem =>
    withItemIcons ? { ...item, icon: Edit } : item,
  );
</script>

<Dropdown {items} selectedId="0" open labelText="Icon slots">
  {#snippet icon({ item })}
    <span data-testid="left-{item.id}">L</span>
  {/snippet}
  {#snippet iconEnd({ item, selected })}
    <span data-testid="right-{item.id}" data-selected={selected}>R</span>
  {/snippet}
</Dropdown>
