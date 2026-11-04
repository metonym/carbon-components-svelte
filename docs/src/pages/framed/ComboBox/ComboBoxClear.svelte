<script>
  import { Button, ComboBox } from "carbon-components-svelte";

  let ref;
</script>

<ComboBox
  labelText="Alert channel"
  placeholder="Select alert channel"
  selectedId="1"
  bind:this={ref}
  items={[
    { id: "0", text: "Slack" },
    { id: "1", text: "Email" },
    { id: "2", text: "Webhook" },
  ]}
/>
<br />
<Button onclick={() => ref.clear()}>Clear</Button>
<Button onclick={() => ref.clear({ focus: false })}>Clear (no focus)</Button>
<Button onclick={() => ref.clear({ open: true })}>Clear (reopen menu)</Button>
