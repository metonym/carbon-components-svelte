<script lang="ts">
  import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
  import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";

  let open = true;
</script>

<button type="button">Before</button>

<InlineNotification bind:open titleText="Saved">
  {#snippet actions()}
    <NotificationActionButton onclick={() => (open = false)}>
      Undo
    </NotificationActionButton>
  {/snippet}
</InlineNotification>
