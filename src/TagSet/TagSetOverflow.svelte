<script>
  /**
   * Internal: the "+N" overflow indicator. Not exported from the package;
   * only `TagSet` ships. Hovering shows a tooltip (a comma-separated list of
   * the hidden labels by default, or custom content from `overflowContent`);
   * clicking calls `ontrigger`.
   *
   * Always mounted (even when `count` is 0) so it stays measurable; visually
   * and functionally inert until there is something to show.
   *
   * With `mode="popover"`, the indicator is an `OperationalTag` whose
   * popover lists the hidden tags as tags, so dismissible ones can still be
   * closed.
   *
   * With more hidden tags than `viewAllThreshold`, the popover lists the
   * first ones and a "View all" button that calls `onviewall`.
   */
  let {
    /** @type {"tooltip" | "popover"} */
    mode = "tooltip",

    /**
     * How the hidden tags are listed: their labels as text, or as tags.
     * @type {"default" | "tag"}
     */
    type = "default",

    /** The popover lists at most this many hidden tags, then "View all". */
    viewAllThreshold = 10,

    /** Text of the popover's "View all" button. */
    viewAllText = "View all",

    /** Set to `true` when the parent's `overflowContent` replaces the default list. */
    customContent = false,

    /** Whether the popover is open, with `mode="popover"`. */
    open = $bindable(false),

    /**
     * Obtain a reference to the popover content, with `mode="popover"`.
     * @type {null | HTMLElement}
     */
    contentRef = $bindable(null),

    /**
     * Obtain a reference to the indicator's HTML element, so the parent can
     * measure its natural width for the fit calculation. With
     * `mode="popover"`, it's the popover trigger button instead.
     * @type {null | HTMLSpanElement}
     */
    triggerRef = $bindable(null),

    /**
     * Obtain a reference to the indicator's focusable button, for the
     * parent's roving keyboard navigation.
     * @type {null | HTMLElement}
     */
    buttonRef = $bindable(null),

    /**
     * Roving `tabindex` from the parent. `undefined` keeps the native order.
     * @type {"0" | "-1" | undefined}
     */
    tabindex = undefined,

    /** @type {string | undefined} */
    id = undefined,

    /** @type {number} */
    count = 0,

    /** @type {import("./tag-set-context.js").TagSetItem[]} */
    tags = [],

    /** @type {"start" | "center" | "end"} */
    overflowAlign = "center",

    /** @type {"top" | "bottom"} */
    overflowDirection = "bottom",

    /** @type {(count: number) => string} */
    overflowLabel = (/** @type {number} */ count) => `+${count} more tags`,

    /** @type {"xs" | "sm" | "default" | "lg" | "md" | undefined} */
    size = undefined,

    /**
     * The indicator was clicked.
     * @type {(() => void) | undefined}
     */
    ontrigger = undefined,

    /**
     * The popover's "View all" button was clicked.
     * @type {(() => void) | undefined}
     */
    onviewall = undefined,

    /**
     * A dismissible tag in the popover was closed.
     * @type {((tag: import("./tag-set-context.js").TagSetItem) => void) | undefined}
     */
    ontagdismiss = undefined,

    /**
     * The popover held focus and has no tag left to take it.
     * @type {(() => void) | undefined}
     */
    onempty = undefined,

    /**
     * The tooltip or popover content.
     * @type {import("svelte").Snippet<[{ tags: import("./tag-set-context.js").TagSetItem[]; count: number }]> | undefined}
     */
    overflowContent = undefined,
  } = $props();

  import { untrack } from "svelte";
  import OperationalTag from "../Tag/OperationalTag.svelte";
  import Tag from "../Tag/Tag.svelte";
  import TooltipDefinition from "../TooltipDefinition/TooltipDefinition.svelte";
  import { setTagSet } from "./tag-set-context.js";

  // The indicator is presentational, not a registered group item. Shadow
  // the context so its tags can't be mistaken for one.
  setTagSet(undefined);

  /**
   * A popover tag closed while focus was in the popover: once that tag is
   * gone from `tags`, move focus to the tag now at its position, else the
   * one before it.
   * @type {null | { id: string; position: number }}
   */
  let pendingFocus = null;

  /** @param {import("./tag-set-context.js").TagSetItem} tag */
  function handleTagClose(tag) {
    const position = tags.indexOf(tag);
    pendingFocus = contentRef?.contains(document.activeElement)
      ? { id: tag.id, position }
      : null;
    ontagdismiss?.(tag);
  }

  // Runs once `tags` has rendered without the closed tag.
  $effect(() => {
    const current = tags;
    untrack(() => {
      if (!pendingFocus || current.some((tag) => tag.id === pendingFocus?.id)) {
        return;
      }
      const { position } = pendingFocus;
      pendingFocus = null;
      const buttons = Array.from(
        contentRef?.querySelectorAll(".bx--tag__close-icon:not(:disabled)") ??
          [],
      );
      const target = buttons[Math.min(position, buttons.length - 1)];
      if (target instanceof HTMLElement) target.focus();
      else onempty?.();
    });
  });

  const hasViewAll = $derived(count > viewAllThreshold);
  // Past the threshold, list the first ones.
  const listLimit = $derived(
    hasViewAll ? viewAllThreshold : Number.POSITIVE_INFINITY,
  );

  // The popover trigger is itself the measured tag.
  $effect.pre(() => {
    if (mode === "popover") {
      triggerRef = /** @type {HTMLSpanElement | null} */ (buttonRef);
    }
  });

  // `TooltipDefinition` keeps its rest props on the outer wrapper, so set
  // the roving `tabindex` on its button directly.
  $effect(() => {
    if (mode !== "tooltip" || !buttonRef) return;
    if (tabindex === undefined) buttonRef.removeAttribute("tabindex");
    else buttonRef.setAttribute("tabindex", tabindex);
  });

  // The popover's content (a Tag with a close button per hidden tag, and
  // "View all") is built the first time it opens, then kept.
  let openedOnce = $state(untrack(() => open));
  $effect.pre(() => {
    if (open) untrack(() => (openedOnce = true));
  });
</script>

{#if mode === "popover"}
  <span
    class={[
      "bx--tag-set-overflow",
      count === 0 && "bx--tag-set-overflow--empty",
    ]}
  >
    <OperationalTag
      bind:ref={buttonRef}
      bind:contentRef
      bind:open
      {id}
      {size}
      {tabindex}
      align={overflowAlign}
      direction={overflowDirection}
      class="bx--tag-set-overflow__popover-trigger"
      on:click={() => ontrigger?.()}
    >
      <!-- In RTL, bidi moves the sign to the far side of the count ("1+"). -->
      <span aria-hidden="true" dir="ltr">+{count}</span>
      <span class="bx--visually-hidden">{overflowLabel(count)}</span>
      {#snippet content()}
        {#if openedOnce}
          {#if customContent}
            {@render overflowContent?.({ tags, count })}
          {:else if type === "tag"}
            <ul class="bx--tag-set-overflow__list">
              {#each tags as tag, index (tag.id)}
                {#if index < listLimit}
                  <li>
                    <Tag
                      type={/** @type {any} */ (tag.type)}
                      filter={tag.filter}
                      disabled={tag.disabled}
                      value={tag.value}
                      {size}
                      ondismiss={() => handleTagClose(tag)}
                    >
                      {tag.label}
                    </Tag>
                  </li>
                {/if}
              {/each}
            </ul>
          {:else}
            <ul
              class="bx--tag-set-overflow__list bx--tag-set-overflow__list--text"
            >
              {#each tags as tag, index (tag.id)}
                {#if index < listLimit}
                  <li>{tag.label}</li>
                {/if}
              {/each}
            </ul>
          {/if}
          {#if hasViewAll}
            <button
              type="button"
              class="bx--link bx--tag-set-overflow__view-all"
              onclick={() => onviewall?.()}
            >
              {viewAllText}
            </button>
          {/if}
        {/if}
      {/snippet}
    </OperationalTag>
  </span>
{:else}
  <TooltipDefinition
    bind:ref={buttonRef}
    {id}
    align={overflowAlign}
    direction={overflowDirection}
    class="bx--tag-set-overflow{count === 0
      ? ' bx--tag-set-overflow--empty'
      : ''}"
    on:click={() => ontrigger?.()}
  >
    {#snippet tooltip()}
      {#if type === "tag" && !customContent}
        <!-- A tooltip can't be interacted with, so its tags don't close. -->
        <ul class="bx--tag-set-overflow__list">
          {#each tags as tag (tag.id)}
            <li>
              <Tag type={/** @type {any} */ (tag.type)} {size}>{tag.label}</Tag>
            </li>
          {/each}
        </ul>
      {:else}
        {@render overflowContent?.({ tags, count })}
      {/if}
    {/snippet}
    <span
      bind:this={triggerRef}
      class={[
        "bx--tag bx--tag--interactive bx--tag-set-overflow__popover-trigger",
        size === "xs" && "bx--tag--xs",
        size === "sm" && "bx--tag--sm",
        size === "lg" && "bx--tag--lg",
      ]}
    >
      <span aria-hidden="true" dir="ltr">+{count}</span>
    </span>
    <span class="bx--visually-hidden">{overflowLabel(count)}</span>
  </TooltipDefinition>
{/if}
