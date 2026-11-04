<script lang="ts">
  import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";
</script>

<ToastNotification>
  {#snippet captionText()}<span>Slot caption</span>{/snippet}
</ToastNotification>
