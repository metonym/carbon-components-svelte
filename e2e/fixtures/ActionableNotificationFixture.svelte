<script>
  import {
    Button,
    InlineNotification,
    NotificationActionButton,
    ToastNotification,
  } from "carbon-components-svelte";

  let inlineOpen = false;
  let toastOpen = false;
</script>

<Button onclick={() => (inlineOpen = true)}>Delete file</Button>
<Button onclick={() => (toastOpen = true)}>Upload</Button>

<InlineNotification
  bind:open={inlineOpen}
  actionable
  kind="success"
  titleText="File deleted"
  subtitleText="quarterly-report.pdf moved to the trash."
>
  {#snippet actions()}
    <NotificationActionButton onclick={() => (inlineOpen = false)}>
      Undo
    </NotificationActionButton>
  {/snippet}
</InlineNotification>

<ToastNotification
  bind:open={toastOpen}
  actionable
  lowContrast
  titleText="Upload failed"
  subtitleText="The connection timed out."
>
  {#snippet actions()}
    <NotificationActionButton onclick={() => (toastOpen = false)}>
      Retry
    </NotificationActionButton>
  {/snippet}
</ToastNotification>
