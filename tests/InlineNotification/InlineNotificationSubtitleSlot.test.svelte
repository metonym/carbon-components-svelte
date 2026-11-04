<script lang="ts">
  import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
</script>

<InlineNotification>
  {#snippet subtitleText()}<span>Slot subtitle</span>{/snippet}
</InlineNotification>
