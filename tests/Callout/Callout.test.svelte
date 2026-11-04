<script lang="ts">
  import Callout from "carbon-components-svelte/Notification/Callout.svelte";
  import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";
  import type { ComponentProps } from "svelte";

  export let kind: ComponentProps<Callout>["kind"] = "info";
  export let lowContrast: ComponentProps<Callout>["lowContrast"] = false;
  export let title: ComponentProps<Callout>["titleText"] = "Scheduled downtime";
  export let subtitle: ComponentProps<Callout>["subtitleText"] = "";
  export let titleId: ComponentProps<Callout>["titleId"] = "callout-title";
  export let statusIconDescription: ComponentProps<Callout>["statusIconDescription"] =
    undefined;
  export let fullWidth: ComponentProps<Callout>["fullWidth"] = false;
  export let action = false;
  export let actionDescribedBy: string | undefined = undefined;
  export let onclick: ((event: MouseEvent) => void) | undefined = undefined;
</script>

<Callout
  {kind}
  {lowContrast}
  titleText={title}
  subtitleText={subtitle}
  {titleId}
  {statusIconDescription}
  {fullWidth}
  data-testid="callout"
  onclick={(e) => onclick?.(e)}
>
  {#snippet actions()}
    {#if action}
      <NotificationActionButton aria-describedby={actionDescribedBy}>
        View schedule
      </NotificationActionButton>
    {/if}
  {/snippet}
</Callout>
