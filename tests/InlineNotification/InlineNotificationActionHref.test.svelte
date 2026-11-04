<script lang="ts">
  import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
  import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";
</script>

<InlineNotification
  kind="info"
  titleText="New features available:"
  subtitleText="Check out what's new."
>
  {#snippet actions()}
    <NotificationActionButton
      href="https://example.com/releases"
      target="_blank">View release notes</NotificationActionButton
    >
  {/snippet}
</InlineNotification>
