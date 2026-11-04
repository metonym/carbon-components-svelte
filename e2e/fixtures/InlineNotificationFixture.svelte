<script>
  import { InlineNotification } from "carbon-components-svelte";

  let open = true;
</script>

<InlineNotification
  data-testid="inline-notification"
  kind="info"
  titleText="Notification title"
  subtitleText="Notification subtitle"
  bind:open
/>

<div data-testid="notification-wide" style:width="1200px">
  <InlineNotification
    fullWidth
    hideCloseButton
    role="status"
    kind="warning"
    titleText="Usage"
    subtitleText="Build minutes are close to the Team limit."
  />
</div>
