<script lang="ts">
  import Callout from "carbon-components-svelte/Notification/Callout.svelte";
  import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";
</script>

<Callout titleText="Scheduled downtime">
  {#snippet actions()}
    <NotificationActionButton {...$$restProps}>
      View schedule
    </NotificationActionButton>
  {/snippet}
</Callout>
