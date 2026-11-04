<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @restProps {button}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the switch text.
     * Alternatively, pass children.
     * @example
     * ```svelte
     * <Switch>
     *   <span>Custom Text</span>
     * </Switch>
     * ```
     */
    text = "Provide text",

    /**
     * Render an icon-only switch.
     * The parent `ContentSwitcher` becomes icon-only when every `Switch` sets `icon`.
     * `text` is used as the accessible label and the tooltip shown on hover and focus.
     * @type {Icon | undefined}
     */
    icon: Icon = undefined,

    /** Set to `true` for the switch to be selected. */
    selected = $bindable(false),

    /** Set to `true` to disable the switch */
    disabled = false,

    /**
     * Align the portalled tooltip to the switch.
     * @type {"start" | "center" | "end"}
     */
    tooltipAlignment = "center",

    /**
     * Set an id for the button element
     * @type {string}
     */
    id = fallbackId,

    /**
     * Obtain a reference to the button HTML element.
     * @type {null | HTMLButtonElement}
     */
    ref = $bindable(null),

    /**
     * Custom switch content, replacing `text` (or the icon).
     * @type {import("svelte").Snippet<[{ selected: boolean }]> | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLButtonElement> | undefined | null} */
    onclick = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import AnchoredTooltip from "../Portal/AnchoredTooltip.svelte";
  import { titleWhenTruncated } from "../utils/title-when-truncated.js";
  import { getContentSwitcher } from "./content-switcher-context.js";

  const ctx = getContentSwitcher();
  const hasIcon = $derived(Icon !== undefined);
  const isSelected = $derived(ctx.currentId === id);

  untrack(() =>
    ctx.add({
      id,
      text,
      selected,
      icon: Icon !== undefined,
      disabled,
    }),
  );
  onMount(() => () => ctx.remove(id));

  // `selected` both selects this switch when set from outside and follows
  // the switcher's selection for `bind:selected`. Remember the last value on
  // each side to tell which one moved.
  let prevSelected = untrack(() => selected);
  $effect.pre(() => {
    if (selected === prevSelected) return;
    prevSelected = selected;
    untrack(() => {
      if (selected) ctx.select(id, false);
      // A content switcher always has one selected switch.
      else if (ctx.currentId === id) selected = prevSelected = true;
    });
  });
  $effect.pre(() => {
    const next = isSelected;
    untrack(() => {
      if (selected !== next) selected = prevSelected = next;
    });
  });

  // Report later changes; the initial values go through `add()`.
  $effect.pre(() => {
    const patch = { disabled, icon: Icon !== undefined };
    untrack(() => ctx.patch(id, patch));
  });

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }} event */
  function handleClick(event) {
    onclick?.(event);
    ctx.select(id, true);
  }
</script>

<button
  bind:this={ref}
  type="button"
  role="tab"
  tabindex={ctx.tabStopId === id ||
  (ctx.tabStopId === null && isSelected && !disabled)
    ? 0
    : -1}
  aria-selected={isSelected ? "true" : "false"}
  aria-label={ariaLabel ?? (hasIcon ? text : undefined)}
  aria-controls={ctx.pairs.panelBySwitch[id]}
  {disabled}
  {id}
  {...rest}
  class={[
    "bx--content-switcher-btn",
    hasIcon && "bx--content-switcher-btn--icon",
    isSelected && "bx--content-switcher--selected",
    className,
  ]}
  onclick={handleClick}
>
  {#if hasIcon}
    {#if children}{@render children({ selected: isSelected })}{:else}<Icon />{/if}
  {:else}
    <span class="bx--content-switcher__label" use:titleWhenTruncated>
      {#if children}{@render children({ selected: isSelected })}{:else}{text}{/if}
    </span>
  {/if}
</button>

<!-- Icon-only switches show `text` as a portalled tooltip on hover and
     focus, so an overflow ancestor can't clip it. -->
{#if hasIcon}
  <AnchoredTooltip
    anchor={ref}
    {text}
    enabled={!disabled}
    direction="top"
    align={tooltipAlignment}
    dismissOnClick={false}
  />
{/if}
