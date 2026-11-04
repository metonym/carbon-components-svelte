<script lang="ts">
  import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";
  import type { ComponentProps } from "svelte";

  export let items: ComponentProps<ComboBox>["items"] = [];
  export let open = false;
  export let typeahead = false;
  export let filterMode: ComponentProps<ComboBox>["filterMode"] = "remove";
</script>

<ComboBox labelText="Region" {items} {typeahead} {filterMode} bind:open>
  {#snippet group({ group, items: groupItems })}
    {`${group} (${groupItems.length})`}
  {/snippet}
</ComboBox>
