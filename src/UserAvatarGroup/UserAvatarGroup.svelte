<script module>
  /** @param {unknown} value */
  function isNegativeGap(value) {
    return typeof value === "string" && value.trim().startsWith("-");
  }

  // A `tooltipText` avatar wraps its element in a `TooltipDefinition`, so the
  // registered node is nested a couple of levels below the direct child that
  // the group's `> *` overlap/stacking CSS targets. Walk up to that direct
  // child so the stacking custom property lands where the CSS reads it.
  /** @param {HTMLElement | undefined} node */
  function overlapTarget(node) {
    let current = node;
    while (
      current?.parentElement &&
      !current.parentElement.classList.contains("bx--user-avatar-group")
    ) {
      current = current.parentElement;
    }
    return current ?? null;
  }
</script>

<script>
  /**
   * Render a row of `UserAvatar` children. The group adds the "+N" overflow chip.
   * @restProps {div}
   */
  let {
    /**
     * Specify the maximum number of avatars to show before collapsing the rest
     * into a "+N" overflow avatar. Set to `0` to show every avatar.
     * @type {number}
     */
    max = 5,

    /**
     * Specify the total number of people represented. Defaults to the number of
     * avatars in `children`. Set this when you render only a subset (large
     * groups) so the overflow count stays right without mounting every avatar.
     * @type {number | undefined}
     */
    total = undefined,

    /**
     * Specify the spacing between avatars. Leave unset for the default
     * overlapping (stacked) layout. A positive value spaces the avatars apart,
     * accepting a Carbon layout scale (`0`–`13`) or a CSS length string. A
     * negative length string (for example `"-1rem"`) overlaps them by that
     * amount.
     * @type {import("../Stack/Stack.svelte").StackScale | string | undefined}
     */
    gap = undefined,

    /**
     * Specify the size of the avatars. Applies to avatars without their own
     * `size`, and to the "+N" overflow chip.
     * @type {"sm" | "md" | "lg" | "xl"}
     */
    size = "md",

    /**
     * Specify which end of the stack renders on top when avatars overlap.
     * `"last"` matches the default browser paint order (and most avatar
     * stacks). `"first"` keeps the first avatar most prominent instead.
     * @type {"last" | "first"}
     */
    stackOrder = "last",

    /**
     * Specify the tooltip text for the "+N" overflow avatar. Defaults to a
     * comma-separated list of the hidden avatars' `name` values. Set this when
     * using `total` for people who are not mounted.
     * @type {string | undefined}
     */
    overflowTooltipText = undefined,

    /**
     * The `UserAvatar`s.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    style = undefined,

    ...rest
  } = $props();

  import { onMount } from "svelte";
  import Stack from "../Stack/Stack.svelte";
  import { toClassName } from "../utils/class-value.js";
  import { sortByDomOrder } from "../utils/sort-by-dom-order.js";
  import { provideTooltipGroup } from "../utils/tooltip-group.js";
  import UserAvatarGroupOverflow from "./UserAvatarGroupOverflow.svelte";
  import { setUserAvatarGroup } from "./user-avatar-group-context.js";

  // Avatar tooltips hand off to each other, and to the rest of an enclosing
  // `TooltipGroup`.
  provideTooltipGroup();

  /**
   * Avatars, in DOM order. Each registers while it initializes, so the
   * server and the first render already hide the avatars past `max` and show
   * the "+N" avatar. Each registration replaces the array.
   * @type {ReadonlyArray<{ id: string; name: string | undefined; node?: HTMLElement }>}
   */
  let items = $state.raw([]);

  // The first render registers in document order. An avatar added after
  // mount registers last wherever it renders, so the list is sorted into
  // DOM order once its element is known.
  let mounted = false;
  let needsSort = false;
  onMount(() => {
    mounted = true;
  });

  // `max` of 0 (or non-positive) means "no limit".
  /** @param {number} limit */
  const hasLimit = (limit) => Number.isFinite(limit) && limit > 0;

  setUserAvatarGroup({
    get size() {
      return size;
    },
    add(entry) {
      if (items.some((item) => item.id === entry.id)) return;
      items = [...items, entry];
      if (mounted) needsSort = true;
    },
    rename(id, name) {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1 || items[index].name === name) return;
      items = items.map((item, i) => (i === index ? { ...item, name } : item));
    },
    // Toggling `tooltipText`, `interactive` or `href` swaps an avatar's root
    // element. The replacement sits in the same place, so the order holds.
    setNode(id, node) {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return;
      if (items[index].node === node && !needsSort) return;
      const next = items.map((item, i) =>
        i === index ? { ...item, node } : item,
      );
      if (needsSort && next.every((item) => item.node)) {
        needsSort = false;
        items = sortByDomOrder(next);
      } else {
        items = next;
      }
    },
    remove(id) {
      items = items.filter((item) => item.id !== id);
    },
    // Reads the registry fresh: avatars ask while they register, and the
    // server memoizes a `$derived` on its first read.
    isOverflow(id) {
      if (!hasLimit(max)) return false;
      const index = items.findIndex((item) => item.id === id);
      return index >= max;
    },
  });

  const overflow = $derived.by(() => {
    const names = items.map((item) => item.name);
    // Shown: capped at `max` unless `max` is 0 (no limit).
    const visible = hasLimit(max) ? Math.min(names.length, max) : names.length;
    // The total represented; defaults to the registered count. Overflow is
    // everyone past the visible avatars, including people not rendered when
    // `total` is set.
    const count = Math.max(0, (total ?? names.length) - visible);
    return {
      count,
      // Capped so it always fits the circle; above 99 reads as "99+".
      label: count > 99 ? "99+" : `+${count}`,
      // Names are known only for the rendered avatars past the visible ones.
      names:
        overflowTooltipText ?? names.slice(visible).filter(Boolean).join(", "),
    };
  });

  // Overlap (stacked) when no gap is set, or when a negative gap tightens the
  // stack; a positive gap switches to a spaced row.
  const overlap = $derived(gap == null || isNegativeGap(gap));
  const stackFirst = $derived(overlap && stackOrder === "first");

  // `stackOrder: "first"` reverses which avatar paints on top. The default
  // paint order already puts the last avatar on top for free, so only the
  // reversed case needs an explicit per-avatar z-index. It's a custom
  // property, not `z-index` itself, so the hover/focus rule can still win on
  // specificity instead of losing to an inline style.
  $effect(() => {
    for (const [index, item] of items.entries()) {
      const target = overlapTarget(item.node);
      if (stackFirst) {
        target?.style.setProperty("--user-avatar-index", String(index));
      } else {
        target?.style.removeProperty("--user-avatar-index");
      }
    }
  });

  // A negative gap overrides the default overlap amount via a custom property.
  const groupStyle = $derived(
    [
      isNegativeGap(gap) && `--user-avatar-group-overlap: ${gap}`,
      stackFirst && `--user-avatar-group-count: ${items.length}`,
      style,
    ]
      .filter(Boolean)
      .join("; ") || undefined,
  );
</script>

<Stack
  orientation="horizontal"
  gap={overlap ? 0 : gap}
  {...rest}
  class={toClassName([
    "bx--user-avatar-group",
    overlap && "bx--user-avatar-group--overlap",
    stackFirst && "bx--user-avatar-group--stack-first",
    className,
  ])}
  style={groupStyle}
>
  {@render children?.()}
  {#if overflow.count > 0}
    <UserAvatarGroupOverflow label={overflow.label} names={overflow.names} />
  {/if}
</Stack>
