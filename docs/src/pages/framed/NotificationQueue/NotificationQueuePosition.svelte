<script>
  import {
    Button,
    ButtonSet,
    NotificationQueue,
  } from "carbon-components-svelte";

  let topRightQueue;
  let topCenterQueue;
  let topLeftQueue;
  let bottomRightQueue;
  let bottomCenterQueue;
  let bottomLeftQueue;
</script>

<NotificationQueue bind:this={topRightQueue} position="top-right" />
<NotificationQueue bind:this={topCenterQueue} position="top-center" />
<NotificationQueue bind:this={topLeftQueue} position="top-left" />
<NotificationQueue bind:this={bottomRightQueue} position="bottom-right" />
<NotificationQueue bind:this={bottomCenterQueue} position="bottom-center" />
<NotificationQueue bind:this={bottomLeftQueue} position="bottom-left" />

<ButtonSet>
  <Button
    onclick={() => {
      topLeftQueue.add({
        kind: "info",
        titleText: "Top left",
      });
    }}
  >
    Add top left
  </Button>
  <Button
    onclick={() => {
      topCenterQueue.add({
        kind: "success",
        titleText: "Top center",
      });
    }}
  >
    Add top center
  </Button>
  <Button
    onclick={() => {
      topRightQueue.add({
        kind: "success",
        titleText: "Top right",
      });
    }}
  >
    Add top right
  </Button>
</ButtonSet>
<br />
<ButtonSet>
  <Button
    onclick={() => {
      bottomLeftQueue.add({
        kind: "warning",
        titleText: "Bottom left",
      });
    }}
  >
    Add bottom left
  </Button>
  <Button
    onclick={() => {
      bottomCenterQueue.add({
        kind: "info",
        titleText: "Bottom center",
      });
    }}
  >
    Add bottom center
  </Button>
  <Button
    onclick={() => {
      bottomRightQueue.add({
        kind: "info",
        titleText: "Bottom right",
      });
    }}
  >
    Add bottom right
  </Button>
</ButtonSet>
