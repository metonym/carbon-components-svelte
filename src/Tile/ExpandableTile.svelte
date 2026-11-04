<script>
  /**
   * @restProps {button | div}
   */

  const fallbackId = $props.id();

  let {
    /** Set to `true` to expand the tile. */
    expanded = $bindable(false),

    /**
     * Specify the collapsed height of the above-the-fold content (number of
     * pixels). Overrides the measured height when greater than 0.
     */
    tileMaxHeight = 0,

    /**
     * Specify the vertical padding of the tile (number of pixels).
     * Overrides the measured padding when greater than 0.
     */
    tilePadding = 0,

    /** Specify the icon text of the collapsed tile */
    tileCollapsedIconText = "Interact to expand Tile",

    /** Specify the icon text of the expanded tile */
    tileExpandedIconText = "Interact to collapse Tile",

    /** Specify the icon label of the expanded tile */
    tileExpandedLabel = "",

    /** Specify the icon label of the collapsed tile */
    tileCollapsedLabel = "",

    /**
     * Set to `true` to round the tile's corners when it has a `decorator`,
     * such as an `AILabel`. Carbon reserves rounded tiles for AI content.
     */
    rounded = false,

    /**
     * Specify the tabindex of the toggle: the tile itself, or the
     * chevron button when the tile has interactive content.
     * @type {number | string | undefined}
     */
    tabindex = "0",

    /**
     * Set an id for the top-level element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Set to `true` if the tile contains interactive content, such as links,
     * buttons, or inputs. The tile renders a `div` instead of a `button` to
     * avoid invalid HTML nesting, and the chevron button becomes the toggle.
     * By default, the tile looks for interactive content once it mounts and
     * switches then. Set to `true` to render the `div` from the start, such
     * as on the server, or `false` to keep the `button` without looking.
     * @type {boolean | undefined}
     */
    hasInteractiveContent = undefined,

    /**
     * Obtain a reference to the top-level element.
     * @type {null | HTMLElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user expands or collapses the tile, with the next
     * state. Call `preventDefault()` to keep the current state. Not called
     * when `expanded` is set from outside.
     * @type {((detail: import("../utils/cancelable.js").Cancelable<{ expanded: boolean }>) => void) | undefined}
     */
    onexpandedchange = undefined,

    /**
     * Content shown while the tile is collapsed.
     * @type {import("svelte").Snippet | undefined}
     */
    above = undefined,

    /**
     * Content revealed when the tile expands.
     * @type {import("svelte").Snippet | undefined}
     */
    below = undefined,

    /**
     * A decorator beside the tile, such as an `AILabel`.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-labelledby": ariaLabelledBy = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLElement> | undefined | null} */
    onclick = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLElement> | undefined | null} */
    onfocus = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLElement> | undefined | null} */
    onblur = undefined,

    ...rest
  } = $props();

  import { onMount, tick, untrack } from "svelte";
  import { writable } from "svelte/store";
  import ChevronDown from "../icons/ChevronDown.svelte";
  import { cancelable } from "../utils/cancelable.js";
  import { observeResize } from "../utils/shared-observer.js";
  import TileWrapper from "./TileWrapper.svelte";

  // HTML's interactive content, which a `button` must not contain, plus
  // any element with a `tabindex`, which it must not contain either.
  const INTERACTIVE_CONTENT = [
    "a[href]",
    "area[href]",
    "audio[controls]",
    "button",
    "details",
    "embed",
    "iframe",
    "input:not([type='hidden'])",
    "label",
    "select",
    "textarea",
    "video[controls]",
    "[tabindex]",
    "[contenteditable]:not([contenteditable='false'])",
  ].join(", ");

  /** @type {null | HTMLDivElement} */
  let refAbove = $state(null);
  /** @type {null | HTMLElement} */
  let chevronRef = $state(null);
  let mounted = $state(false);
  let detectedInteractive = $state(false);

  const interactive = $derived(hasInteractiveContent ?? detectedInteractive);

  /**
   * Whether the button holds interactive content. The switch to the `div`
   * replaces the button and everything in it, so a focused tile hands focus
   * to the chevron button that takes over as the toggle.
   * @param {HTMLElement} node
   * @returns {boolean}
   */
  function checkContent(node) {
    if (!node.querySelector(INTERACTIVE_CONTENT)) return false;
    if (node.contains(document.activeElement)) {
      tick().then(() => chevronRef?.focus());
    }
    return true;
  }

  // Look for interactive content in the button. Content can arrive after
  // mount, so keep watching until it does. The server cannot look, so it
  // renders the `button`.
  $effect(() => {
    if (!mounted || hasInteractiveContent !== undefined) return;
    if (detectedInteractive) return;
    const node = ref;
    if (!node) return;
    if (untrack(() => checkContent(node))) {
      detectedInteractive = true;
      return;
    }
    const observer = new MutationObserver(() => {
      if (!detectedInteractive && checkContent(node)) {
        detectedInteractive = true;
      }
    });
    observer.observe(node, {
      childList: true,
      subtree: true,
      attributeFilter: ["href", "tabindex", "contenteditable", "controls"],
    });
    return () => observer.disconnect();
  });

  /**
   * Internal, measured fallbacks. These are only used when the consumer has
   * not explicitly set the corresponding public prop, so that `bind:` values
   * used to *control* the layout are never clobbered by measurements.
   */
  let measuredMaxHeight = $state(0);
  let measuredPadding = $state(0);

  /**
   * Read the tile's vertical padding. `getComputedStyle` forces a style
   * recalc, so this runs when the tile mounts or resizes rather than on
   * every re-render (hover, content).
   */
  function measurePadding() {
    if (!ref) return;
    const style = getComputedStyle(ref);
    measuredPadding =
      (Number.parseInt(style.getPropertyValue("padding-top"), 10) || 0) +
      (Number.parseInt(style.getPropertyValue("padding-bottom"), 10) || 0);
  }

  onMount(() => {
    // Measure synchronously so the first frame has a height, rather than
    // waiting for the observer's first report.
    if (refAbove) measuredMaxHeight = refAbove.getBoundingClientRect().height;
    measurePadding();
    mounted = true;
  });

  // Follow the elements as they change, such as when interactive content
  // swaps the root tag.
  $effect(() => {
    if (!mounted) return;
    /** @type {Array<() => void>} */
    const stops = [];
    if (refAbove) {
      stops.push(
        observeResize(refAbove, (entry) => {
          measuredMaxHeight = entry.contentRect.height;
        }),
      );
    }
    if (ref) stops.push(observeResize(ref, measurePadding));
    return () => {
      for (const stop of stops) stop();
    };
  });

  function toggle() {
    const next = !expanded;
    const detail = cancelable({ expanded: next });
    onexpandedchange?.(detail);
    if (!detail.defaultPrevented) expanded = next;
  }

  const iconText = $derived(
    expanded ? tileExpandedIconText : tileCollapsedIconText,
  );
  const label = $derived(expanded ? tileExpandedLabel : tileCollapsedLabel);
  const effectiveMaxHeight = $derived(
    tileMaxHeight > 0 ? tileMaxHeight : measuredMaxHeight,
  );
  const effectivePadding = $derived(
    tilePadding > 0 ? tilePadding : measuredPadding,
  );

  /**
   * Starts active with a decorator, so the server renders the AI surface.
   * `Decorator` clears it when no `AILabel` claims the slot.
   * @type {import("svelte/store").Writable<undefined | "active" | "revert">}
   */
  const aiLabelState = writable(
    untrack(() => decorator) ? "active" : undefined,
  );
</script>

<TileWrapper
  {decorator}
  state={aiLabelState}
  class="bx--tile__wrapper--expandable"
>
  <!-- With interactive content, the chevron button is the toggle, so
       naming and description go there instead of onto the tile `div`. -->
  <svelte:element
    this={interactive ? "div" : "button"}
    bind:this={ref}
    type={interactive ? undefined : "button"}
    {id}
    aria-expanded={interactive ? undefined : expanded ? "true" : "false"}
    aria-controls={interactive ? undefined : `${id}-content`}
    aria-label={interactive ? undefined : ariaLabel}
    aria-labelledby={interactive ? undefined : ariaLabelledBy}
    aria-describedby={interactive ? undefined : ariaDescribedBy}
    tabindex={interactive ? undefined : tabindex}
    title={interactive ? undefined : iconText}
    style:max-height={expanded || effectiveMaxHeight <= 0
      ? "none"
      : `${effectiveMaxHeight + effectivePadding}px`}
    {onfocus}
    {onblur}
    {...rest}
    class={[
      "bx--tile",
      "bx--tile--expandable",
      interactive && "bx--tile--expandable--interactive",
      expanded && "bx--tile--is-expanded",
      !expanded && effectiveMaxHeight <= 0 && "bx--tile--unmeasured",
      decorator && "bx--tile--decorator",
      rounded && decorator && "bx--tile--decorator-rounded",
      $aiLabelState === "active" && "bx--tile--ai-label",
      className,
    ]}
    onclick={(
      /** @type {MouseEvent & { currentTarget: EventTarget & HTMLElement }} */ event,
    ) => {
      onclick?.(event);
      if (!interactive) toggle();
    }}
  >
    <div>
      <div bind:this={refAbove} class="bx--tile-content">
        <span class="bx--tile-content__above-the-fold">
          {@render above?.()}
        </span>
      </div>
      <!-- A `div` only inside the tile `button`, which takes the click. -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <svelte:element
        this={interactive ? "button" : "div"}
        bind:this={chevronRef}
        type={interactive ? "button" : undefined}
        tabindex={interactive ? tabindex : undefined}
        class="bx--tile__chevron"
        aria-expanded={interactive ? expanded : undefined}
        aria-label={interactive
          ? (ariaLabel ?? (label ? undefined : iconText))
          : undefined}
        aria-labelledby={interactive ? ariaLabelledBy : undefined}
        aria-describedby={interactive ? ariaDescribedBy : undefined}
        aria-controls={interactive ? `${id}-content` : undefined}
        title={interactive ? iconText : undefined}
        onclick={() => {
          if (interactive) toggle();
        }}
        onfocus={interactive ? onfocus : undefined}
        onblur={interactive ? onblur : undefined}
      >
        <span>{label}</span>
        <ChevronDown />
      </svelte:element>
      <div class="bx--tile-content">
        <span id="{id}-content" class="bx--tile-content__below-the-fold">
          {@render below?.()}
        </span>
      </div>
    </div>
  </svelte:element>
</TileWrapper>
