<script lang="ts">
  import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

  const items = [
    { id: "0", text: "Slack" },
    { id: "1", text: "Email" },
  ];
</script>

<ComboBox
  labelText="Contact"
  {items}
  shouldFilterItem={(item, value) =>
    item.text.toLowerCase().includes(value.toLowerCase())}
>
  {#snippet empty({ value })}
    {`Nothing like "${value}"`}
  {/snippet}
</ComboBox>
