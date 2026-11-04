<script>
  import {
    Button,
    ButtonSet,
    NotificationQueue,
  } from "carbon-components-svelte";

  let queue;
</script>

<NotificationQueue bind:this={queue} />

<ButtonSet>
  <Button
    onclick={() => {
      queue.add({
        kind: "success",
        titleText: "Deployment succeeded",
        subtitleText: "Build #482 deployed to production.",
        timeout: 3000,
      });
    }}
  >
    Show success
  </Button>
  <Button
    kind="tertiary"
    onclick={() => {
      queue.add({
        kind: "error",
        titleText: "API rate limit exceeded",
        subtitleText: "Requests are being throttled. Try again in 60 seconds.",
        timeout: 3000,
      });
    }}
  >
    Show error
  </Button>
  <Button
    kind="tertiary"
    onclick={() => {
      queue.add({
        kind: "info",
        titleText: "Scheduled maintenance",
        subtitleText: "Maintenance window begins tonight at 10:00 PM UTC.",
        timeout: 3000,
      });
    }}
  >
    Show info
  </Button>
  <Button
    kind="tertiary"
    onclick={() => {
      queue.add({
        kind: "warning",
        titleText: "Certificate expiring soon",
        subtitleText: "TLS certificate for api.example.com expires in 7 days.",
        timeout: 3000,
      });
    }}
  >
    Show warning
  </Button>
</ButtonSet>
