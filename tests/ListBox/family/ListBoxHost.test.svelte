<script lang="ts">
  import type { ComponentType } from "svelte";

  type Trigger = { detail: { trigger: string } };
  type ScrollMetrics = {
    detail: {
      scrollTop: number;
      scrollHeight: number;
      clientHeight: number;
    };
  };

  export let component: ComponentType;
  export let fieldProps: Record<string, unknown> = {};
  export let open = false;
  export let onOpen: (e: Trigger) => void = () => {};
  export let onClose: (e: Trigger) => void = () => {};
  export let onScroll: (e: Event) => void = () => {};
  export let onScrollend: (e: ScrollMetrics) => void = () => {};
</script>

<!-- Legacy list boxes dispatch `open`, `close` and `scrollend`; runes ones
     call `onopenchange` and `onmenuscrollend`. Both reach the same handlers
     in the `{ detail }` shape the shared tests read. -->
<svelte:component
  this={component}
  {...fieldProps}
  bind:open
  on:open={onOpen}
  on:close={onClose}
  on:scroll={onScroll}
  on:scrollend={onScrollend}
  onopenchange={(detail: { open: boolean; trigger: string }) =>
    (detail.open ? onOpen : onClose)(
      new CustomEvent("trigger", { detail: { trigger: detail.trigger } }),
    )}
  onmenuscrollend={(detail: ScrollMetrics["detail"]) =>
    onScrollend(new CustomEvent("scrollend", { detail }))}
/>
