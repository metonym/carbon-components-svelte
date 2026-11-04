<svelte:options accessors />

<script lang="ts">
  import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
  import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";
  import type { ComponentProps } from "svelte";

  export let selectedIndex: ComponentProps<ContentSwitcher>["selectedIndex"] = 0;
  export let customClass = "";
  export let switchRef: ComponentProps<Switch>["ref"] = null;
  export let ref: ComponentProps<ContentSwitcher>["ref"] = null;
  export let onChange: (detail: number) => void = () => {};
  export let onClick: () => void = () => {};
  export let onMouseover: () => void = () => {};
  export let onMouseenter: () => void = () => {};
  export let onMouseleave: () => void = () => {};
</script>

<ContentSwitcher
  bind:ref
  {selectedIndex}
  class={customClass}
  onselectedchange={(e) => onChange(e.index)}
  onclick={onClick}
  onmouseover={onMouseover}
  onmouseenter={onMouseenter}
  onmouseleave={onMouseleave}
>
  <Switch text="Option 1" />
  <Switch text="Option 2" bind:ref={switchRef} />
  <Switch text="Option 3" />
</ContentSwitcher>
