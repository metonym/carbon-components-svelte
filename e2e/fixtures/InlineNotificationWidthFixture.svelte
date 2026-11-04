<script>
  import {
    InlineNotification,
    NotificationActionButton,
  } from "carbon-components-svelte";
</script>

{#each [18, 40] as rem (rem)}
  <div data-width={rem} style="width: {rem}rem">
    <InlineNotification
      kind="info"
      titleText="Deployment finished"
      subtitleText="billing-api is live in 3 regions."
    >
      {#snippet actions()}
        <NotificationActionButton>View logs</NotificationActionButton>
      {/snippet}
    </InlineNotification>
  </div>
{/each}
