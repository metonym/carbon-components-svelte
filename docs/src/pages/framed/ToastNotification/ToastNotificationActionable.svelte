<script>
  import {
    Button,
    NotificationActionButton,
    Stack,
    ToastNotification,
  } from "carbon-components-svelte";

  let open = false;
</script>

<Stack gap={5} align="start">
  <Button disabled={open} onclick={() => (open = true)}>Upload report</Button>

  <ToastNotification
    bind:open
    actionable
    lowContrast
    titleText="Upload failed"
    subtitleText="The connection timed out before quarterly-report.pdf finished."
    captionText={new Date().toLocaleString()}
  >
    {#snippet actions()}
      <NotificationActionButton onclick={() => (open = false)}>
        Retry
      </NotificationActionButton>
    {/snippet}
  </ToastNotification>
</Stack>
