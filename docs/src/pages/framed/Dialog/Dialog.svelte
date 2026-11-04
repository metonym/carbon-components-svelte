<script>
  import { Button, Dialog, Stack } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>View build logs</Button>

<Dialog bind:open aria-label="Build logs">
  <Stack gap={5}>
    <p>
      This panel has no backdrop, so you can keep watching the deployment queue
      while it's open.
    </p>
    <Button onclick={() => (open = false)}>Close</Button>
  </Stack>
</Dialog>
