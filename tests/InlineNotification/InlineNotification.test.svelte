<script lang="ts">
  import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
  import type { ComponentProps } from "svelte";

  export let kind: ComponentProps<InlineNotification>["kind"] = "error";
  export let lowContrast: ComponentProps<InlineNotification>["lowContrast"] = false;
  export let timeout: ComponentProps<InlineNotification>["timeout"] = 0;
  export let pauseOnHover: ComponentProps<InlineNotification>["pauseOnHover"] = false;
  export let role: ComponentProps<InlineNotification>["role"] = "status";
  export let title: ComponentProps<InlineNotification>["titleText"] = "";
  export let subtitle: ComponentProps<InlineNotification>["subtitleText"] = "";
  export let closeButtonDescription: ComponentProps<InlineNotification>["closeButtonDescription"] =
    "Close notification";
  export let hideCloseButton: ComponentProps<InlineNotification>["hideCloseButton"] = false;
  export let onclose: ComponentProps<InlineNotification>["onopenchange"] =
    undefined;
  export let onclick: ((event: MouseEvent) => void) | undefined = undefined;
</script>

<InlineNotification
  {kind}
  {lowContrast}
  {timeout}
  {pauseOnHover}
  {role}
  titleText={title}
  subtitleText={subtitle}
  {closeButtonDescription}
  {hideCloseButton}
  onopenchange={(e) => onclose?.(e)}
  onclick={(e) => onclick?.(e)}
  {...$$restProps}
/>
