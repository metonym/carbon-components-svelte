<script lang="ts">
  import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

  const items = [
    { id: "0", text: "Slack" },
    { id: "1", text: "Email" },
  ];
</script>

<MultiSelect labelText="Contact" {items} filterable>
  {#snippet empty({ value })}
    {`Nothing like "${value}"`}
  {/snippet}
</MultiSelect>
