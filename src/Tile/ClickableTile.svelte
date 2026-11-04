<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @restProps {a}
   */
  let {
    /**
     * Whether the tile has been clicked.
     * Toggles on click and on Space/Enter. Read it with `bind:clicked`.
     */
    clicked = $bindable(false),

    /**
     * Set the size: `"sm"` for a compact tile, such as a row in a list of
     * choices, with less padding and no minimum height.
     * @type {"sm" | "md" | undefined}
     */
    size = undefined,

    /** Set to `true` to disable the tile */
    disabled = false,

    /** Set to `true` to stretch the tile to fill the height of its container */
    fullHeight = false,

    /** Set to `true` to remove the tile's padding */
    noPadding = false,

    /**
     * Set to `true` to round the tile's corners when it has a `decorator`,
     * such as an `AILabel`. Carbon reserves rounded tiles for AI content.
     */
    rounded = false,

    /**
     * Specify an icon to render in the bottom-right corner (bottom-left and
     * mirrored in right-to-left layouts), such as `ArrowRight` for a link
     * within the app or `Launch` for an external link. The icon is
     * decorative and hidden from assistive technology.
     * @type {Icon | undefined}
     */
    icon: TileIcon = undefined,

    /**
     * Set the `href`.
     * @type {string | undefined}
     */
    href = undefined,

    /**
     * Obtain a reference to the underlying anchor HTML element.
     * @type {null | HTMLAnchorElement}
     */
    ref = $bindable(null),

    /**
     * The tile content.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * A decorator beside the tile, such as an `AILabel`.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    target = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLAnchorElement> | undefined | null} */
    onclick = undefined,

    /** @type {import("svelte/elements").KeyboardEventHandler<HTMLAnchorElement> | undefined | null} */
    onkeydown = undefined,

    ...rest
  } = $props();

  import { untrack } from "svelte";
  import { writable } from "svelte/store";
  import { resolveLinkRel } from "../utils/link-rel.js";
  import TileWrapper from "./TileWrapper.svelte";

  // `clicked` is an output. Keep it as local state and mirror it into the
  // prop, so a parent that re-renders without binding it doesn't reset it.
  let isClicked = $state(untrack(() => clicked));
  $effect.pre(() => {
    const next = isClicked;
    untrack(() => {
      if (clicked !== next) clicked = next;
    });
  });

  // Without `href`, the anchor is neither focusable nor a link, so give it
  // button semantics for the Enter/Space handling below. Spread before the
  // rest props so a consumer's own `role` or `tabindex` wins; omitted
  // entirely when disabled, where the anchor gets `role="link"`.
  const buttonProps = $derived(
    href || disabled ? {} : { role: "button", tabindex: "0" },
  );

  /**
   * Starts active with a decorator, so the server renders the AI surface.
   * `Decorator` clears it when no `AILabel` claims the slot.
   * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
   */
  const aiLabelState = writable(
    untrack(() => decorator) ? "active" : undefined,
  );

  const linkClass = $derived([
    "bx--tile",
    "bx--tile--clickable",
    isClicked && "bx--tile--is-clicked",
    size === "sm" && "bx--tile--sm",
    fullHeight && "bx--tile--full-height",
    noPadding && "bx--tile--no-padding",
    decorator && "bx--tile--decorator",
    rounded && decorator && "bx--tile--decorator-rounded",
    $aiLabelState === "active" && "bx--tile--ai-label",
    className,
    "bx--link",
    disabled && "bx--link--disabled",
  ]);

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement }} event */
  function handleClick(event) {
    onclick?.(event);
    isClicked = !isClicked;
  }

  /** @param {KeyboardEvent & { currentTarget: EventTarget & HTMLAnchorElement }} event */
  function handleKeydown(event) {
    onkeydown?.(event);
    // A focused <a href> already fires a native click on Enter, and the
    // click handler above picks that up. Space never does, and Enter does
    // not without href. Click only in those cases so Enter with href does
    // not toggle `clicked` twice.
    if (event.key === " " || (event.key === "Enter" && !href)) {
      event.preventDefault();
      // A held Space would click on every auto-repeat; a native button
      // activates once per press.
      if (event.repeat && event.key === " ") return;
      ref?.click();
    }
  }
</script>

<!-- Rendered as a plain anchor with Link's classes, not a Link: a tile
     grid would otherwise mount two components per tile. -->
<TileWrapper
  {decorator}
  state={aiLabelState}
  class="bx--tile__wrapper--clickable"
>
  {#if disabled}
    <a
      bind:this={ref}
      role="link"
      aria-disabled="true"
      {target}
      {...rest}
      class={linkClass}
      onclick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      {onkeydown}
    >
      {@render children?.()}
      {#if TileIcon}
        <TileIcon class="bx--tile--icon" aria-hidden="true" />
      {/if}
    </a>
  {:else}
    <a
      bind:this={ref}
      rel={resolveLinkRel(target)}
      {href}
      {target}
      {...buttonProps}
      {...rest}
      class={linkClass}
      onclick={handleClick}
      onkeydown={handleKeydown}
    >
      {@render children?.()}
      {#if TileIcon}
        <TileIcon class="bx--tile--icon" aria-hidden="true" />
      {/if}
    </a>
  {/if}
</TileWrapper>
