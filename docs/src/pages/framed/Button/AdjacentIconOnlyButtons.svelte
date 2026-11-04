<script>
  import { Button } from "carbon-components-svelte";
  import Add from "carbon-icons-svelte/lib/Add.svelte";
  import Save from "carbon-icons-svelte/lib/Save.svelte";
  import TrashCan from "carbon-icons-svelte/lib/TrashCan.svelte";

  let lastAction = "";
</script>

<Button
  kind="ghost"
  iconDescription="Add"
  tooltipPosition="right"
  icon={Add}
  onclick={() => (lastAction = "Add")}
/>
<Button
  kind="ghost"
  iconDescription="Delete"
  tooltipPosition="right"
  icon={TrashCan}
  onclick={() => (lastAction = "Delete")}
/>
<Button
  kind="ghost"
  iconDescription="Save"
  tooltipPosition="right"
  icon={Save}
  onclick={() => (lastAction = "Save")}
/>

{#if lastAction}
  Clicked: {lastAction}
{/if}
