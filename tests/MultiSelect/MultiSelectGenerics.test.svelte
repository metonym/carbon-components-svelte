<script lang="ts">
  import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

  export let onSelect: (detail: unknown) => void = () => {};

  const items = [
    { id: "1", text: "Laptop", price: 999, category: "Electronics" },
    { id: "2", text: "Phone", price: 599, category: "Electronics" },
    { id: "3", text: "Desk", price: 299, category: "Furniture" },
  ] as const;
</script>

<MultiSelect
  {items}
  label="Choose products"
  labelText="Products"
  onselectedchange={(e) => onSelect(e.selected)}
>
  {#snippet children({ item })}{@const { id, text, price, category } = item}
    <div>
      <strong>{text}</strong>
      - ${price}
      - {id}
      <span>({category})</span>
    </div>{/snippet}
</MultiSelect>
