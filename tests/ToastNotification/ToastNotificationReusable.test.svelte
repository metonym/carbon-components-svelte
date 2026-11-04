<script lang="ts">
  import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";
  import type { ComponentProps } from "svelte";

  export let open = false;
  export let timeout: ComponentProps<ToastNotification>["timeout"] = 0;
  export let title: ComponentProps<ToastNotification>["titleText"] = "Error";
  export let subtitle: ComponentProps<ToastNotification>["subtitleText"] =
    "An internal server error occurred.";
  export let caption: ComponentProps<ToastNotification>["captionText"] =
    "2024-03-21 12:00:00";
</script>

<ToastNotification
  bind:open
  {timeout}
  titleText={title}
  subtitleText={subtitle}
  captionText={caption}
/>
