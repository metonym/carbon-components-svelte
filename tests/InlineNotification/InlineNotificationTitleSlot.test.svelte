<script lang="ts">
  import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
</script>

<InlineNotification>
  {#snippet titleText()}<span>Slot title</span>{/snippet}
</InlineNotification>
