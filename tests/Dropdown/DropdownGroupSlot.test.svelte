<script lang="ts">
  import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";
  import type { ComponentProps } from "svelte";

  export let items: ComponentProps<Dropdown>["items"] = [];
</script>

<Dropdown labelText="Region" {items} open>
  {#snippet group({ group, items: groupItems })}
    {`${group} (${groupItems.length})`}
  {/snippet}
</Dropdown>
