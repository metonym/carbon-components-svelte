<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @restProps {a}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the tab label. It also names icon-only tabs, their tooltip and
     * the dismiss button. Pass `children` to render custom content instead.
     */
    label = "",

    /** Specify the href attribute */
    href = "#",

    /** Set to `true` to disable the tab */
    disabled = false,

    /**
     * Specify the tabindex of the selected tab.
     * Unselected tabs use `-1`, so the tab list is a single Tab-key stop
     * and arrow keys move between tabs.
     * Ignored when `Tabs` sets `navigation`.
     * @type {number | string | undefined}
     */
    tabindex = "0",

    /**
     * Set an id for the tab.
     * Use a stable value with `Tabs` `selectedId` when tabs are added or removed dynamically.
     * @type {string}
     */
    id = fallbackId,

    /**
     * Specify an optional secondary label, or a snippet.
     * Only rendered for container type tabs.
     * @type {string | import("svelte").Snippet}
     */
    secondaryLabel = "",

    /**
     * Specify the icon to render.
     * Icon is rendered to the right of the label by default.
     * When the parent `Tabs` is `dismissible`, the icon is rendered to the left.
     * When the parent `Tabs` is `iconOnly`, only the icon is rendered and the
     * `label` is used as the accessible name and the tooltip shown on hover/focus.
     * @type {Icon | undefined}
     */
    icon: TabIcon = undefined,

    /**
     * Obtain a reference to the anchor HTML element.
     * @type {null | HTMLAnchorElement}
     */
    ref = $bindable(null),

    /**
     * Set the tooltip placement of an icon-only tab in floating-ui form: the
     * side, then `start` or `end` along it, as Popover's `align` takes. Above
     * and below, `start` and `end` name inline sides, so they swap under
     * `dir="rtl"`.
     * @type {"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | undefined}
     */
    tooltipAlign = undefined,

    /**
     * Custom tab content, replacing `label` (or the icon of an icon-only tab).
     * @type {import("svelte").Snippet<[{ selected: boolean }]> | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-controls": ariaControls = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import AnchoredTooltip from "../Portal/AnchoredTooltip.svelte";
  import Close from "../icons/Close.svelte";
  import { tooltipPlacement } from "../utils/tooltip-align.js";
  import { getTabs } from "./tabs-context.js";

  const ctx = getTabs();

  const hasOwnSecondaryLabel = $derived(Boolean(secondaryLabel));

  // Register while initializing, so the server and the first render know
  // this tab. Later changes go through `patch`.
  untrack(() =>
    ctx.add({
      id,
      label,
      disabled,
      hasSecondaryLabel: hasOwnSecondaryLabel,
    }),
  );
  onMount(() => () => ctx.remove(id));
  $effect.pre(() => {
    const patch = { label, disabled, hasSecondaryLabel: hasOwnSecondaryLabel };
    untrack(() => ctx.patch(id, patch));
  });

  const selected = $derived(ctx.selectedTabId === id);
  // A tab draws its own secondary label from the first render; its
  // siblings learn of it, and make room, once it registers.
  const ownSecondaryLabel = $derived(
    ctx.secondaryLabelSupported && hasOwnSecondaryLabel,
  );
  const twoLines = $derived(ctx.hasSecondaryLabel || ownSecondaryLabel);
  // A container tab that draws its label alone, with no secondary label
  // or placeholder under it.
  const singleLine = $derived(ctx.container && !ctx.iconOnly && !twoLines);
  // Default href is the "#" placeholder, so tabs behave as selection controls.
  // Any other href is user-provided and should navigate like a link.
  const isLink = $derived(!!href && href !== "#");
  const panelId = $derived(ctx.panelIdFor(id));
  const placement = $derived(
    tooltipPlacement(tooltipAlign, "bottom", "center"),
  );

  /** @param {MouseEvent} event */
  function handleClick(event) {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (!isLink && !ctx.navigation) event.preventDefault();
    ctx.select(id);
  }

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    if (disabled) return;

    if (ctx.dismissible && event.key === "Delete") {
      ctx.dismiss(id);
      return;
    }

    // Enter and Space on the dismiss button click it, not the tab.
    if (event.target !== ref) return;

    // Links activate natively on Enter, which fires the click above.
    if (ctx.navigation) return;

    if (event.key === " ") {
      event.preventDefault();
      ctx.select(id);
    } else if (event.key === "Enter") {
      if (!isLink) event.preventDefault();
      ctx.select(id);
    }
  }
</script>

{#snippet text(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

{#snippet labelContent()}
  {#if children}{@render children({ selected })}{:else}{label}{/if}
{/snippet}

<li
  role="presentation"
  class={[
    "bx--tabs__nav-item",
    disabled && "bx--tabs__nav-item--disabled",
    selected && "bx--tabs__nav-item--selected",
    !disabled && !selected && "bx--tabs__nav-item--default",
    ctx.container && "bx--tabs__nav-item--container",
    ownSecondaryLabel && "bx--tabs__nav-item--secondary-label",
    ctx.container &&
      selected &&
      !disabled &&
      "bx--tabs__nav-item--container-selected",
  ]}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  <a
    bind:this={ref}
    role={ctx.navigation ? undefined : "tab"}
    tabindex={ctx.navigation ? undefined : selected ? tabindex : "-1"}
    aria-selected={ctx.navigation ? undefined : selected}
    aria-current={ctx.navigation && selected ? "page" : undefined}
    aria-disabled={disabled}
    aria-controls={ariaControls ?? (ctx.navigation ? undefined : panelId)}
    aria-label={ariaLabel ?? (ctx.iconOnly ? label : undefined)}
    {id}
    href={ctx.navigation && disabled ? undefined : href}
    {...rest}
    class={[
      "bx--tabs__nav-link",
      selected && !disabled && "bx--tabs__nav-link--selected",
      ctx.container &&
        selected &&
        !disabled &&
        "bx--tabs__nav-link--container-selected",
      TabIcon && !ctx.iconOnly && "bx--tabs__nav-link--icon",
      ctx.iconOnly && "bx--tabs__nav-link--icon-only",
      singleLine && "bx--tabs__nav-link--single-line",
      className,
    ]}
    style:width={ctx.iconOnly
      ? undefined
      : ctx.fullWidth
        ? "100%"
        : ctx.autoWidth
          ? "auto"
          : undefined}
  >
    {#if ctx.iconOnly}
      <div class="bx--tabs__nav-item--icon">
        {#if children}{@render children({ selected })}{:else if TabIcon}<TabIcon
          />{/if}
      </div>
      <!-- Visible only in the mobile dropdown; hidden in the desktop icon-only row. -->
      <span class="bx--tabs__nav-item-label">{label}</span>
    {:else if twoLines}
      <div class="bx--tabs__nav-item-label-wrapper">
        <span class="bx--tabs__nav-item-label" data-label={label || undefined}>
          {@render labelContent()}
        </span>
        {#if TabIcon}
          <div class="bx--tabs__nav-item--icon"><TabIcon /></div>
        {/if}
      </div>
      {#if secondaryLabel}
        <div
          class="bx--tabs__nav-item-secondary-label"
          title={typeof secondaryLabel === "string"
            ? secondaryLabel
            : undefined}
        >
          {@render text(secondaryLabel)}
        </div>
      {:else}
        <div
          class="bx--tabs__nav-item-secondary-label"
          aria-hidden="true"
        ></div>
      {/if}
    {:else}
      {#if ctx.dismissible && TabIcon}
        <div class="bx--tabs__nav-item--icon-left"><TabIcon /></div>
      {/if}
      <span class="bx--tabs__nav-item-label" data-label={label || undefined}>
        {@render labelContent()}
      </span>
      {#if TabIcon && !ctx.dismissible}
        <div class="bx--tabs__nav-item--icon"><TabIcon /></div>
      {/if}
    {/if}
  </a>
  {#if ctx.dismissible}
    <div class="bx--tabs__nav-item--close">
      <button
        type="button"
        tabindex="-1"
        aria-label={ctx.dismissText(label ?? "")}
        class={[
          "bx--tabs__nav-item--close-icon",
          disabled && "bx--tabs__nav-item--close-icon--disabled",
        ]}
        {disabled}
        onclick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) ctx.dismiss(id);
        }}
      >
        <Close aria-hidden="true" />
      </button>
    </div>
  {/if}

  <!-- Icon-only tabs show `label` as a portalled tooltip on hover and
       focus, so the tab nav's overflow can't clip it. -->
  {#if ctx.iconOnly}
    <AnchoredTooltip
      anchor={ref}
      text={label}
      enabled={!disabled}
      direction={placement.position}
      align={placement.alignment}
      dismissOnClick={false}
    />
  {/if}
</li>
