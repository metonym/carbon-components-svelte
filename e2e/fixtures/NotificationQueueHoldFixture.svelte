<script>
  import { Button, NotificationQueue } from "carbon-components-svelte";

  // `?position=bottom-right` runs the same cases from the bottom edge.
  const position =
    new URLSearchParams(location.search).get("position") ?? "top-right";

  let queue;
  let count = 0;
</script>

<NotificationQueue bind:this={queue} {position} />
<Button
  data-testid="nq-hold-add"
  onclick={() => {
    count += 1;
    queue?.add({
      titleText: `Toast ${count}`,
      subtitleText: "Saved to drafts",
    });
  }}
>
  Add toast
</Button>
