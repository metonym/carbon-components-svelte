<script lang="ts">
  import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";
</script>

<ToastNotification>
  {#snippet titleText()}<span>Slot title</span>{/snippet}
</ToastNotification>
