<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @restProps {div | button | a}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the type of tag.
     * @type {"red" | "magenta" | "purple" | "blue" | "cyan" | "teal" | "green" | "gray" | "cool-gray" | "warm-gray" | "high-contrast" | "outline" | undefined}
     */
    type = undefined,

    /**
     * Specify the size of the tag.
     * Defaults to `"default"`, or to the `size` of a parent `TagSet`.
     * Also accepts Carbon v11's `"md"` (`"default"`).
     * @type {"xs" | "sm" | "default" | "lg" | "md" | undefined}
     */
    size = undefined,

    /** Set to `true` to use filterable variant */
    filter = false,

    /** Set to `true` to disable a filterable tag */
    disabled = false,

    /** Set to `true` to render a `button` element instead of a `div` */
    interactive = false,

    /**
     * Specify the `href` attribute to render the tag as an anchor.
     * Mutually exclusive with `filter`; when both are set, `filter` takes precedence.
     * @type {string | undefined}
     */
    href = undefined,

    /** Set to `true` to display the skeleton state */
    skeleton = false,

    /**
     * Set the label of the close button in a filterable tag.
     * Shown in a tooltip on hover and focus, and leads the button's accessible name.
     * The tag element gets no native `title` attribute from this prop.
     */
    title = "Clear filter",

    /**
     * Override the tag's 208px width cap.
     * Accepts any CSS length (for example `"8rem"`, `"120px"`, or `"100%"` to fit the container).
     * At any width, a truncated label shows its full text in a tooltip.
     * @type {string | undefined}
     */
    maxWidth = undefined,

    /**
     * Specify the icon to render.
     * @type {Icon | undefined}
     */
    icon: Icon = undefined,

    /**
     * Specify a value that identifies the tag inside a `TagSet`.
     * Returned as `tag.value` in the set's `ontagdismiss` callback.
     * @type {string | number | undefined}
     */
    value = undefined,

    /**
     * Set an id for the filterable tag
     * @type {string}
     */
    id = fallbackId,

    /**
     * Obtain a reference to the outer HTML element.
     * @type {null | HTMLAnchorElement | HTMLButtonElement | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * Called when the close button of a filterable tag is clicked.
     * @type {(() => void) | undefined}
     */
    ondismiss = undefined,

    /**
     * The tag's label. In a filterable tag, it receives `{ props }` to spread
     * on your own label element. Defaults to the `type`.
     * @type {import("svelte").Snippet<[{ props: { class: string } }]> | undefined}
     */
    children = undefined,

    /**
     * Render an AI label or other decorator after the label.
     * @type {import("svelte").Snippet | undefined}
     */
    decorator = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {number | string | undefined | null} */
    tabindex = undefined,

    /** @type {string | undefined | null} */
    target = undefined,

    /** @type {string | undefined | null} */
    rel = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-labelledby": ariaLabelledBy = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    ...rest
  } = $props();

  import { writable } from "svelte/store";
  import Decorator from "../AILabel/Decorator.svelte";
  import AnchoredTooltip from "../Portal/AnchoredTooltip.svelte";
  import { joinTagSet } from "../TagSet/join-tag-set.js";
  import TooltipDefinition from "../TooltipDefinition/TooltipDefinition.svelte";
  import Close from "../icons/Close.svelte";
  import { resolveLinkRel } from "../utils/link-rel.js";
  import { normalizeSize, TAG_SIZE_ALIASES } from "../utils/size-aliases.js";
  import TagSkeleton from "./TagSkeleton.svelte";
  import { observeTruncation } from "./tag-truncation.js";

  /** @type {null | HTMLSpanElement} */
  let labelRef = $state(null);
  /** @type {null | HTMLButtonElement} */
  let closeRef = $state(null);
  let truncated = $state(false);
  let truncationLabel = $state("");

  // Inside a `TagSet`, register so the set can measure this tag's natural
  // width, collapse it into "+N" once it no longer fits, and include it in
  // roving focus. Standalone, the stores are inert.
  const group = joinTagSet(() => ({
    node: ref,
    label: labelRef?.textContent?.trim() ?? "",
    value,
    type,
    size: resolvedSize,
    disabled,
    filter,
  }));
  const {
    size: groupSize,
    navigation: groupNavigation,
    overflow: groupOverflow,
    tabindex: rovingTabindex,
  } = group;

  // Fall back to the group's size, then to "default".
  const resolvedSize = $derived(
    normalizeSize(size, TAG_SIZE_ALIASES) ?? $groupSize ?? "default",
  );

  // A truncated label shows its full text in a tooltip. Static tags wrap
  // the label in `TooltipDefinition`. Interactive and link tags are already
  // a button or an anchor, so the tooltip anchors to the tag itself instead
  // of nesting another control. A roving `TagSet` is a single tab stop,
  // which the definition's focusable trigger would break, and a disabled
  // tag gets no hover or focus: both fall back to `title`. A filter tag's
  // close button is its only tab stop, and its name already includes the
  // full label, so the label takes `title`, as in Carbon v11.
  const showTruncationTooltip = $derived(
    truncated &&
      !filter &&
      !interactive &&
      !href &&
      $groupNavigation !== "roving",
  );
  const showHostTooltip = $derived(
    truncated && (interactive || !!href) && !disabled,
  );
  const nativeTitle = $derived(
    truncated && !showTruncationTooltip && !showHostTooltip
      ? truncationLabel
      : undefined,
  );

  const tagClass = $derived([
    "bx--tag",
    disabled && "bx--tag--disabled",
    maxWidth != null && "bx--tag--truncate",
    Icon && "bx--tag--with-icon",
    resolvedSize === "xs" && "bx--tag--xs",
    resolvedSize === "sm" && "bx--tag--sm",
    resolvedSize === "lg" && "bx--tag--lg",
    type && `bx--tag--${type}`,
    className,
  ]);

  // In a filter tag, the close button is the only focusable element, so
  // naming and description go there instead of onto the wrapper.
  const rootAria = $derived(
    filter
      ? {}
      : {
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledBy,
          "aria-describedby": ariaDescribedBy,
        },
  );

  /** @param {boolean} overflowing */
  function setTruncated(overflowing) {
    truncated = overflowing;
    truncationLabel = overflowing ? (labelRef?.textContent?.trim() ?? "") : "";
  }

  // Measure once the label is laid out, then whenever it resizes: a new
  // `maxWidth`, size or icon, or a container narrower than the cap.
  // Swapping the root element or wrapping the label in the tooltip mounts
  // a new label node, which is observed in turn.
  $effect(() => {
    if (labelRef) return observeTruncation(labelRef, setTruncated);
  });

  // Toggling `filter`, `interactive` or `href` swaps the root element, so the
  // set must be told about the new node too.
  $effect(() => {
    group.update({
      node: ref,
      value,
      type,
      size: resolvedSize,
      disabled,
      filter,
    });
  });

  /** @param {MouseEvent} event */
  function handleClose(event) {
    event.stopPropagation();
    ondismiss?.();
    group.notifyClose();
  }

  /** @type {import("svelte/store").Writable<undefined | "active" | "revert">} */
  const aiLabelState = writable(undefined);
</script>

{#snippet iconMarkup()}
  {#if Icon}
    <div class="bx--tag__custom-icon"><Icon /></div>
  {/if}
{/snippet}

{#snippet decoratorMarkup()}
  {#if decorator}
    <Decorator
      class="bx--tag__decorator"
      state={aiLabelState}
      labelSize="sm"
      labelKind="inline"
      labelAlign="start"
    >
      {@render decorator()}
    </Decorator>
  {/if}
{/snippet}

{#snippet label()}
  <span bind:this={labelRef} class="bx--tag__label">
    {@render children?.({ props: { class: "bx--tag__label" } })}
  </span>
{/snippet}

{#if skeleton}
  <TagSkeleton
    size={resolvedSize}
    {...rest}
    {...rootAria}
    class={className}
    {tabindex}
  />
{:else if filter}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex: the consumer's own tabindex -->
  <div
    bind:this={ref}
    {id}
    data-overflow={$groupOverflow ? "true" : undefined}
    {tabindex}
    {...rest}
    class={[tagClass, "bx--tag--filter"]}
    style:max-width={maxWidth}
  >
    {@render iconMarkup()}
    <span
      bind:this={labelRef}
      id="{id}-label"
      title={nativeTitle}
      class="bx--tag__label"
    >
      {#if children}
        {@render children({ props: { class: "bx--tag__label" } })}
      {:else}
        {type}
      {/if}
    </span>
    {@render decoratorMarkup()}
    <button
      type="button"
      id="{id}-close"
      aria-label={ariaLabel ?? title}
      aria-labelledby={ariaLabelledBy ??
        (ariaLabel ? undefined : `${id}-close ${id}-label`)}
      aria-describedby={ariaDescribedBy}
      aria-keyshortcuts={$groupNavigation === "roving"
        ? "Delete Backspace"
        : undefined}
      class="bx--tag__close-icon"
      tabindex={$rovingTabindex}
      {disabled}
      bind:this={closeRef}
      onclick={handleClose}
    >
      <Close />
    </button>
    <AnchoredTooltip
      anchor={closeRef}
      text={title}
      enabled={!disabled}
      passEscapeWhenFocused
    />
  </div>
{:else if href}
  <a
    bind:this={ref}
    href={disabled ? undefined : href}
    role={disabled ? "link" : undefined}
    {id}
    aria-disabled={disabled ? "true" : undefined}
    tabindex={tabindex ?? $rovingTabindex}
    {target}
    rel={rel ?? resolveLinkRel(target)}
    data-overflow={$groupOverflow ? "true" : undefined}
    title={nativeTitle}
    {...rest}
    {...rootAria}
    class={[tagClass, "bx--tag--interactive"]}
    style:max-width={maxWidth}
  >
    {@render iconMarkup()}
    {@render label()}
  </a>
  <AnchoredTooltip
    anchor={ref}
    text={truncationLabel}
    enabled={showHostTooltip}
    passEscapeWhenFocused
  />
{:else if interactive}
  <button
    bind:this={ref}
    type="button"
    {id}
    {disabled}
    aria-disabled={disabled ? "true" : "false"}
    tabindex={disabled ? -1 : (tabindex ?? $rovingTabindex)}
    title={nativeTitle}
    data-overflow={$groupOverflow ? "true" : undefined}
    {...rest}
    {...rootAria}
    class={[tagClass, "bx--tag--interactive"]}
    style:max-width={maxWidth}
  >
    {@render iconMarkup()}
    {@render label()}
  </button>
  <AnchoredTooltip
    anchor={ref}
    text={truncationLabel}
    enabled={showHostTooltip}
    passEscapeWhenFocused
  />
{:else}
  <!-- As in Carbon v11, `tabindex` applies to the tooltip trigger, the
  element that takes focus, so a composite parent can pass `-1` to keep a
  truncated tag out of the tab order. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex: the consumer's own tabindex -->
  <div
    bind:this={ref}
    {id}
    data-overflow={$groupOverflow ? "true" : undefined}
    title={nativeTitle}
    tabindex={showTruncationTooltip ? undefined : tabindex}
    {...rest}
    {...rootAria}
    class={tagClass}
    style:max-width={maxWidth}
  >
    {@render iconMarkup()}
    {#if showTruncationTooltip}
      <TooltipDefinition
        class="bx--tag__label-tooltip"
        tooltipText={truncationLabel}
        {tabindex}
        portalTooltip
      >
        {@render label()}
      </TooltipDefinition>
    {:else}
      {@render label()}
    {/if}
    {@render decoratorMarkup()}
  </div>
{/if}
