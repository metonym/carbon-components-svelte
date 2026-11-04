<script>
  import {
    Button,
    InlineNotification,
    NotificationActionButton,
    Stack,
  } from "carbon-components-svelte";

  let open = false;
</script>

<Stack gap={5} align="start">
  <Button kind="danger" disabled={open} onclick={() => (open = true)}>
    Delete API key
  </Button>

  <InlineNotification
    bind:open
    actionable
    kind="success"
    titleText="API key deleted:"
    subtitleText="Requests that use the key now fail."
  >
    {#snippet actions()}
      <NotificationActionButton onclick={() => (open = false)}>
        Undo
      </NotificationActionButton>
    {/snippet}
  </InlineNotification>
</Stack>
