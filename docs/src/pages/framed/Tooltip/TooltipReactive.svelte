<script>
  import { Button, Stack, Tooltip } from "carbon-components-svelte";

  let open = true;
</script>

<Stack gap={12}>
  <Tooltip bind:open triggerText="Resource list" align="start">
    <p>Resources are provisioned based on your account's organization.</p>
  </Tooltip>
  <div>
    <Button kind="tertiary" size="small" onclick={() => (open = !open)}>
      {open ? "Close tooltip" : "Open tooltip"}
    </Button>
  </div>
</Stack>
