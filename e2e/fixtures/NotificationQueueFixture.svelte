<script>
  import { Button, NotificationQueue } from "carbon-components-svelte";

  let queue;
  let undone = false;
</script>

<svelte:window
  on:keydown={(e) => {
    if (e.key === "Delete") queue?.clear();
  }}
/>

<div data-testid="notification-queue-root">
  <NotificationQueue bind:this={queue} maxNotifications={2} />
  <Button
    data-testid="nq-add"
    onclick={() => {
      queue?.add({ titleText: "Toast A" });
    }}
  >
    Add toast
  </Button>
  <Button
    data-testid="nq-t1"
    onclick={() => {
      queue?.add({ titleText: "T1" });
    }}
  >
    T1
  </Button>
  <Button
    data-testid="nq-t2"
    onclick={() => {
      queue?.add({ titleText: "T2" });
    }}
  >
    T2
  </Button>
  <Button
    data-testid="nq-t3"
    onclick={() => {
      queue?.add({ titleText: "T3" });
    }}
  >
    T3
  </Button>
  <Button
    data-testid="nq-timed"
    onclick={() => {
      queue?.add({ titleText: "Quick", timeout: 400 });
    }}
  >
    Add timed
  </Button>
  <Button
    data-testid="nq-slow"
    onclick={() => {
      queue?.add({ titleText: "Slow", timeout: 800 });
    }}
  >
    Add slow
  </Button>
  <Button
    data-testid="nq-action"
    onclick={() => {
      queue?.add({
        titleText: "Report deleted",
        timeout: 400,
        action: { label: "Undo", onClick: () => (undone = true) },
      });
    }}
  >
    Add with action
  </Button>
  <p data-testid="nq-undone">{undone ? "Undone" : "Not undone"}</p>
</div>
