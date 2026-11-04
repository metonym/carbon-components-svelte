<script>
  import { Button, ToastNotification } from "carbon-components-svelte";
  import { fade } from "svelte/transition";

  let timeout;
  $: showNotification = timeout !== undefined;
</script>

<Button
  disabled={showNotification}
  onclick={() => {
    timeout = 3_000; // 3 seconds
  }}
>
  Show notification
</Button>

{#if showNotification}
  <div transition:fade>
    <ToastNotification
      {timeout}
      kind="success"
      titleText="Export complete"
      subtitleText="This notification will autoclose in {timeout.toLocaleString()} ms."
      captionText={new Date().toLocaleString()}
      onopenchange={(e) => {
        timeout = undefined;
        console.log(e.trigger); // "timeout" when it closed on its own
      }}
    />
  </div>
{/if}
