<script lang="ts">
  import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";
  import Tag from "carbon-components-svelte/Tag/Tag.svelte";

  export let selectedIds: string[] = ["a", "b", "c"];

  const items = [
    { id: "a", text: "Alpha" },
    { id: "b", text: "Beta" },
    { id: "c", text: "Gamma" },
  ];
</script>

<MultiSelect
  labelText="Letters"
  {items}
  selectionDisplay="tags"
  bind:selectedIds
>
  {#snippet tag({ item, index, props })}
    <Tag
      {...props}
      filter={props.filter && item.id !== "a"}
      type={item.id === "c" ? "red" : "blue"}
      data-index={index}
    >
      {item.text}
    </Tag>
  {/snippet}
</MultiSelect>

<div data-testid="selected">{JSON.stringify(selectedIds)}</div>
