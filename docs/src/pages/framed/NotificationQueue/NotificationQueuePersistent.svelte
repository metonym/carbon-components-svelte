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
        kind: "warning",
        titleText: "Persistent notification",
        subtitleText:
          "This notification has no close button and will not auto-dismiss.",
        hideCloseButton: true,
      });
    }}
  >
    Add persistent
  </Button>
  <Button
    onclick={() => {
      queue.add({
        kind: "info",
        titleText: "Auto-dismiss notification",
        subtitleText:
          "This notification has no close button but will auto-dismiss after 3 seconds.",
        hideCloseButton: true,
        timeout: 3000,
      });
    }}
  >
    Add auto-dismiss
  </Button>
  <Button
    onclick={() => {
      queue.clear();
    }}
  >
    Clear all
  </Button>
</ButtonSet>
