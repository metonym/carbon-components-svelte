<script>
  import { Button, NotificationQueue } from "carbon-components-svelte";

  let queue;
</script>

<NotificationQueue bind:this={queue} />

<Button
  onclick={() => {
    const id = queue.add({
      id: "upload",
      kind: "info",
      titleText: "Uploading...",
      subtitleText: "0%",
      hideCloseButton: true,
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress < 100) {
        queue.update(id, { subtitleText: `${progress}%` });
      } else {
        clearInterval(interval);
        queue.update(id, {
          kind: "success",
          titleText: "Upload complete",
          subtitleText: "All files have been uploaded.",
          hideCloseButton: false,
          timeout: 3000,
        });
      }
    }, 600);
  }}
>
  Start upload
</Button>
