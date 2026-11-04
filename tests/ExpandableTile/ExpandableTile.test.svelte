<script lang="ts">
  import ExpandableTile from "carbon-components-svelte/Tile/ExpandableTile.svelte";
  import type { ComponentProps } from "svelte";

  export let expanded: ComponentProps<ExpandableTile>["expanded"] = false;
  export let tileMaxHeight: ComponentProps<ExpandableTile>["tileMaxHeight"] = 0;
  export let tilePadding: ComponentProps<ExpandableTile>["tilePadding"] = 0;
  export let tileCollapsedIconText: ComponentProps<ExpandableTile>["tileCollapsedIconText"] =
    "Interact to expand Tile";
  export let tileExpandedIconText: ComponentProps<ExpandableTile>["tileExpandedIconText"] =
    "Interact to collapse Tile";
  export let tileExpandedLabel: ComponentProps<ExpandableTile>["tileExpandedLabel"] =
    "";
  export let tileCollapsedLabel: ComponentProps<ExpandableTile>["tileCollapsedLabel"] =
    "";
  export let tabindex: ComponentProps<ExpandableTile>["tabindex"] = "0";
  export let id: ComponentProps<ExpandableTile>["id"] = "ccs-test";
  export let ref: ComponentProps<ExpandableTile>["ref"] = null;
  export let onToggle: ComponentProps<ExpandableTile>["onexpandedchange"] =
    () => {};
  export let onClick: (e: MouseEvent) => void = () => {};
  export let onKeydown: (e: KeyboardEvent) => void = () => {};
  export let onMouseover: (e: MouseEvent) => void = () => {};
  export let onMouseenter: (e: MouseEvent) => void = () => {};
  export let onMouseleave: (e: MouseEvent) => void = () => {};
</script>

<ExpandableTile
  bind:expanded
  {tileMaxHeight}
  {tilePadding}
  {tileCollapsedIconText}
  {tileExpandedIconText}
  {tileExpandedLabel}
  {tileCollapsedLabel}
  {tabindex}
  {id}
  bind:ref
  onexpandedchange={onToggle}
  onkeydown={onKeydown}
  onclick={onClick}
  onmouseover={onMouseover}
  onmouseenter={onMouseenter}
  onmouseleave={onMouseleave}
>
  {#snippet above()}<div data-testid="above-content">
      Above the fold content here
    </div>{/snippet}
  {#snippet below()}<div data-testid="below-content">
      Below the fold content here
    </div>{/snippet}
</ExpandableTile>
