<script lang="ts">
  import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";
</script>

<ToastNotification>
  {#snippet subtitleText()}<span>Slot subtitle</span>{/snippet}
</ToastNotification>
