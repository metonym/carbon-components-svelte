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
        titleText: "Report deleted",
        subtitleText: "Q3 revenue summary moved to trash.",
        action: {
          label: "Undo",
          onClick: () => {
            queue.add({
              kind: "info",
              titleText: "Report restored",
              subtitleText: "Q3 revenue summary is back in Reports.",
              timeout: 3000,
            });
          },
        },
      });
    }}
  >
    Delete report
  </Button>
  <Button
    kind="tertiary"
    onclick={() => {
      const id = queue.add({
        kind: "error",
        titleText: "Upload failed",
        subtitleText:
          "The connection timed out before quarterly-report.pdf finished.",
        action: {
          label: "Retry",
          onClick: (event) => {
            // Keep the toast open and show progress in place.
            event.preventDefault();
            queue.update(id, {
              kind: "info",
              titleText: "Retrying upload",
              subtitleText: "Uploading quarterly-report.pdf.",
              action: undefined,
              hideCloseButton: true,
            });
            setTimeout(() => {
              queue.update(id, {
                kind: "success",
                titleText: "Upload complete",
                subtitleText: "quarterly-report.pdf is in Reports.",
                hideCloseButton: false,
                timeout: 3000,
              });
            }, 1500);
          },
        },
      });
    }}
  >
    Upload file
  </Button>
</ButtonSet>
