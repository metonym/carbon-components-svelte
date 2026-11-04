<script lang="ts">
  import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
  import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";

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

<InlineNotification
  kind="warning"
  {timeout}
  onopenchange={(event) => onclose?.(event)}
>
  {#snippet actions()}
    <NotificationActionButton>Learn more</NotificationActionButton>
  {/snippet}
</InlineNotification>
