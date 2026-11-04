<script>
  import { Button, InlineNotification } from "carbon-components-svelte";
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
    <InlineNotification
      {timeout}
      pauseOnHover
      kind="success"
      titleText="Export complete:"
      subtitleText="This notification will autoclose in {timeout.toLocaleString()} ms. Hover to pause the countdown."
      onopenchange={(e) => {
        timeout = undefined;
        console.log(e.trigger); // "timeout" when it closed on its own
      }}
    />
  </div>
{/if}
