<script lang="ts">
  import Button from "carbon-components-svelte/Button/Button.svelte";
  import ExpandableTile from "carbon-components-svelte/Tile/ExpandableTile.svelte";
  import type { ComponentProps } from "svelte";

  export let buttonClicked = false;
  export let linkClicked = false;
  /** Set to `false` to let child clicks bubble up to the tile. */
  export let stopClicks = true;
  export let tabindex: ComponentProps<ExpandableTile>["tabindex"] = "0";
  export let onFocus: (e: FocusEvent) => void = () => {};
  export let onBlur: (e: FocusEvent) => void = () => {};
  export let onToggle: ComponentProps<ExpandableTile>["onexpandedchange"] =
    () => {};
</script>

<ExpandableTile
  hasInteractiveContent
  {tabindex}
  tileExpandedLabel="View less"
  tileCollapsedLabel="View more"
  onfocus={onFocus}
  onblur={onBlur}
  onexpandedchange={onToggle}
>
  {#snippet above()}<div>
      <a
        href="/"
        data-testid="test-link"
        on:click|preventDefault={(e) => {
          if (stopClicks) e.stopPropagation();
          linkClicked = true;
        }}
      >
        Test link
      </a>
      <br /><br />
      <Button
        data-testid="test-button"
        onclick={(e) => {
          if (stopClicks) e.stopPropagation();
          buttonClicked = true;
        }}
      >
        Test button
      </Button>
    </div>{/snippet}
  {#snippet below()}<div>Below the fold content here</div>{/snippet}
</ExpandableTile>
