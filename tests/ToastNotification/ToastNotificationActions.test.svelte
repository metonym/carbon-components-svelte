<script lang="ts">
  import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";
  import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";

  export let href: string | undefined = undefined;
  export let timeout = 0;
  export let onclose:
    | ((
        detail: import("carbon-components-svelte/utils/cancelable.js").Cancelable<{
          open: boolean;
          trigger: "close-button" | "escape-key" | "timeout";
        }>,
      ) => void)
    | undefined = undefined;
</script>

<ToastNotification
  titleText="Upload failed"
  subtitleText="The connection timed out."
  captionText="10:42 AM"
  {timeout}
  onopenchange={(event) => onclose?.(event)}
>
  {#snippet actions()}
    <NotificationActionButton {href}>Retry</NotificationActionButton>
  {/snippet}
</ToastNotification>
