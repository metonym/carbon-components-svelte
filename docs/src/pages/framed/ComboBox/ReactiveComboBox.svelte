<script>
  import { Button, ComboBox } from "carbon-components-svelte";

  let selectedId = "1";
</script>

<ComboBox
  labelText="Alert channel"
  placeholder="Select alert channel"
  bind:selectedId
  items={[
    { id: "0", text: "Slack" },
    { id: "1", text: "Email" },
    { id: "2", text: "Webhook" },
  ]}
/>
<br />
<Button onclick={() => (selectedId = undefined)}>
  Set to undefined (unselected)
</Button>
<Button onclick={() => (selectedId = "2")}>Set to 2 (Webhook)</Button>
