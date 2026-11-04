<script>
  import {
    Button,
    ButtonSet,
    NotificationQueue,
  } from "carbon-components-svelte";

  let queue;
  let count = 0;
</script>

<NotificationQueue bind:this={queue} />

<ButtonSet>
  <Button
    onclick={() => {
      queue.add({
        id: "id",
        kind: "warning",
        titleText: "Duplicate notification",
        subtitleText:
          "This notification has the same id. Click the button multiple times.",
      });
    }}
  >
    Add duplicate
  </Button>
  <Button
    onclick={() => {
      queue.add({
        id: `id-${count++}`,
        kind: "info",
        titleText: "Unique notification",
        subtitleText: "This has a unique id, so it will always appear.",
      });
    }}
  >
    Add unique
  </Button>
</ButtonSet>
