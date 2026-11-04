<script lang="ts">
  import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";
  import type { ComponentProps } from "svelte";

  export let kind: ComponentProps<ToastNotification>["kind"] = "error";
  export let lowContrast: ComponentProps<ToastNotification>["lowContrast"] = false;
  export let timeout: ComponentProps<ToastNotification>["timeout"] = 0;
  export let pauseOnHover: ComponentProps<ToastNotification>["pauseOnHover"] = false;
  export let role: ComponentProps<ToastNotification>["role"] = "status";
  export let title: ComponentProps<ToastNotification>["titleText"] = "";
  export let subtitle: ComponentProps<ToastNotification>["subtitleText"] = "";
  export let caption: ComponentProps<ToastNotification>["captionText"] = "";
  export let closeButtonDescription: ComponentProps<ToastNotification>["closeButtonDescription"] =
    "Close notification";
  export let hideCloseButton: ComponentProps<ToastNotification>["hideCloseButton"] = false;
  export let fullWidth: ComponentProps<ToastNotification>["fullWidth"] = false;
  export let onclose: ComponentProps<ToastNotification>["onopenchange"] =
    undefined;
  export let onclick: ((event: MouseEvent) => void) | undefined = undefined;
</script>

<ToastNotification
  {kind}
  {lowContrast}
  {timeout}
  {pauseOnHover}
  {role}
  titleText={title}
  subtitleText={subtitle}
  captionText={caption}
  {closeButtonDescription}
  {hideCloseButton}
  {fullWidth}
  onopenchange={(e) => onclose?.(e)}
  onclick={(e) => onclick?.(e)}
  {...$$restProps}
/>
