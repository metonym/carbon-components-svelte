<script lang="ts">
  import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";
  import type { ComponentProps } from "svelte";

  export let items: ComponentProps<MultiSelect>["items"] = [];
</script>

<MultiSelect {items}>
  {#snippet children({ item, index })}<div>
      <strong>{item.id} {item.text} {index}</strong>
    </div>{/snippet}
</MultiSelect>
