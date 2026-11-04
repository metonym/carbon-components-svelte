<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   */

  /**
   * @extendProps {"./ButtonSkeleton.svelte"} ButtonSkeletonProps
   * @restProps {button | a}
   */

  let {
    /**
     * Specify the kind of button.
     * @type {"primary" | "secondary" | "tertiary" | "ghost" | "danger" | "danger-tertiary" | "danger-ghost"}
     */
    kind = "primary",

    /**
     * Specify the size of button.
     * When `badge` is set, size is set to `lg` per Carbon design guidelines.
     * Falls back to the size set by an ancestor `ActionSet` when unset, then
     * to the height of a parent `Form`'s size (`xs`, `small` for `sm`,
     * `default` for `xl`).
     * Use `"xs"` for icon-only buttons in dense layouts.
     * Also accepts Carbon v11's `"sm"` (`"small"`), `"md"` (`"field"`) and
     * `"2xl"` (`"xl"`). `"lg"` and `"xl"` keep this library's 64px and 80px;
     * Carbon v11's 48px `lg` and 64px `xl` are `"default"` and `"lg"` here.
     * @type {"default" | "field" | "small" | "xs" | "lg" | "xl" | "sm" | "md" | "2xl" | undefined}
     * @default "default"
     */
    size = undefined,

    /** Set to `true` to use Carbon's expressive typesetting */
    expressive = false,

    /**
     * Set to `true` to enable the selected state for an icon-only, ghost button.
     */
    isSelected = false,

    /**
     * Set to `true` to render an icon-only button even when children are
     * passed (they aren't rendered), as from a wrapper that forwards
     * optional text; `false` to always render a labelled button.
     * Unset, a button with an icon and no children is icon-only.
     * Without an icon, the button is always labelled.
     * @type {boolean | undefined}
     */
    iconOnly = undefined,

    /** Set to `true` to span the full width of the container */
    fullWidth = false,

    /**
     * Specify the icon to render.
     * @type {Icon | undefined}
     */
    icon: Icon = undefined,

    /**
     * Render custom icon markup instead of the `icon` component, such as
     * an icon at another size. Spread `props` on your icon.
     * @type {import("svelte").Snippet<[{ props: { class: string; "aria-hidden": "true"; style: string | undefined } }]> | undefined}
     * @example
     * ```svelte
     * <Button iconDescription="Add">
     *   {#snippet iconChildren({ props })}<Add {...props} size={20} />{/snippet}
     * </Button>
     * ```
     */
    iconChildren = undefined,

    /**
     * Specify the ARIA label for the button icon.
     * On an icon-only button, this also drives Carbon's tooltip. If omitted,
     * the icon-only button renders without a tooltip; supply your own
     * `aria-label` or `aria-labelledby` for accessibility in that case.
     * @type {string | undefined}
     */
    iconDescription = undefined,

    /**
     * Specify a keyboard shortcut for the button, such as `"mod+s"`. `mod` is
     * Command on Apple platforms and Ctrl elsewhere. The button shows the
     * keys (in its tooltip when icon-only), sets `aria-keyshortcuts`, and is
     * clicked when the shortcut is pressed while it's enabled and shown, and,
     * while a modal is open, inside it. A shortcut the app binds with
     * `onShortcut` takes precedence.
     */
    shortcut = "",

    /**
     * Called when `shortcut` is pressed, before the button is clicked.
     * Call `preventDefault()` to skip the click.
     * @type {((detail: import("../utils/cancelable.js").Cancelable<{ event: KeyboardEvent }>) => void) | undefined}
     */
    onshortcut = undefined,

    /**
     * Set the tooltip placement in floating-ui form: the side, then `start`
     * or `end` along it, as Popover's `align` takes. Above and below,
     * `start` and `end` name inline sides, so they swap under `dir="rtl"`.
     * When set, takes precedence over `tooltipPosition` and `tooltipAlignment`.
     * @type {"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end" | undefined}
     */
    tooltipAlign = undefined,

    /**
     * Set the alignment of the tooltip relative to the icon.
     * Only applies to icon-only buttons.
     * @deprecated use `tooltipAlign`
     * @type {"start" | "center" | "end"}
     */
    tooltipAlignment = "center",

    /**
     * Set the position of the tooltip relative to the icon.
     * @deprecated use `tooltipAlign`
     * @type {"top" | "right" | "bottom" | "left"}
     */
    tooltipPosition = "bottom",

    /**
     * Set to `true` to hide the tooltip while maintaining accessibility.
     * Only applies to icon-only buttons.
     * When `true`, the tooltip is visually hidden but the `iconDescription` remains accessible to screen readers.
     */
    hideTooltip = false,

    /**
     * Render your own element in place of the button. Spread `props` on it.
     * `ref` stays `null`; use `bind:this` on your own element instead.
     * @type {import("svelte").Snippet<[{ props: Record<string, any> }]> | undefined}
     * @example
     * ```svelte
     * <Button>
     *   {#snippet child({ props })}<div {...props}>Custom Element</div>{/snippet}
     * </Button>
     * ```
     */
    child = undefined,

    /** Set to `true` to display the skeleton state */
    skeleton = false,

    /** Set to `true` to disable the button */
    disabled = false,

    /**
     * Set the `href` to use an anchor link.
     * @type {string | undefined}
     */
    href = undefined,

    /**
     * Specify the tabindex
     * @type {number | string | undefined}
     */
    tabindex = "0",

    /** Specify the `type` attribute for the button element */
    type = "button",

    /**
     * Obtain a reference to the HTML element.
     * Stays `null` with `child`; use `bind:this` on your own element instead.
     * @type {null | HTMLAnchorElement | HTMLButtonElement}
     */
    ref = $bindable(null),

    /**
     * Set to `true` to always render the icon-only tooltip in a portal, which
     * also flips it when the preferred direction lacks space, or `false` to
     * keep it in place. Left unset, the tooltip opens in a portal inside a
     * `Modal`, or when a box around it (`overflow` other than `visible`, such
     * as a `DataTable`) would cut it off.
     * @type {boolean | undefined}
     */
    portalTooltip = undefined,

    /**
     * Set to `true` to display a loading spinner in place of the icon
     * and prevent the button from being activated.
     * Unlike `disabled`, the button remains focusable; use `disabled`
     * as well if it should also be removed from the tab order.
     */
    loading = false,

    /**
     * Specify the accessible description for the loading spinner.
     * @type {string | undefined}
     */
    loadingDescription = undefined,

    /**
     * Wait this many milliseconds after `loading` turns `true` before showing
     * the spinner. Once shown, the spinner stays for at least 500 ms, so fast
     * work shows nothing and slow work never flashes. The button blocks clicks
     * and sets `aria-busy` as soon as `loading` is `true`.
     * Set to `0` to show the spinner at once.
     */
    loadingDelay = 0,

    /**
     * The button's label.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * Compose a `BadgeIndicator` overlaid on an icon-only button. Size is set
     * to `lg` automatically.
     * @type {import("svelte").Snippet | undefined}
     */
    badge = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    style = undefined,

    /** @type {string | undefined | null} */
    target = undefined,

    /** @type {string | undefined | null} */
    rel = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLElement> | undefined | null} */
    onclick = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLElement> | undefined | null} */
    onfocus = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLElement> | undefined | null} */
    onblur = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLElement> | undefined | null} */
    onmouseenter = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLElement> | undefined | null} */
    onmouseleave = undefined,

    ...rest
  } = $props();

  import { getContext, onMount, untrack } from "svelte";
  import Kbd from "../Kbd/Kbd.svelte";
  import Loading from "../Loading/Loading.svelte";
  import PortalTooltip from "../Portal/PortalTooltip.svelte";
  import { iconTooltipPortalGaps } from "../Portal/icon-tooltip-portal-gaps.js";
  import { observeModalClose } from "../Portal/portal-utils.js";
  import {
    FORM_SIZE_CONTEXT_KEY,
    MODAL_CONTEXT_KEY,
  } from "../constants/context-keys.js";
  import { cancelable } from "../utils/cancelable.js";
  import { createLoadingIndicator } from "../utils/delayed-loading.js";
  import { dismiss } from "../utils/dismiss.svelte.js";
  import { clippedBy } from "../utils/fit-align.js";
  import { formButtonSize } from "../utils/form-button-size.js";
  import { isImeComposition } from "../utils/ime-composition.js";
  import {
    applePlatform,
    ariaKeyShortcuts,
    keyboardShortcut,
  } from "../utils/keyboard-shortcut.js";
  import { resolveLinkRel } from "../utils/link-rel.js";
  import { BUTTON_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";
  import { tooltipPlacement } from "../utils/tooltip-align.js";
  import { ignoreTooltipClicks } from "../utils/tooltip-clicks.js";
  import { closeOverControls } from "../utils/tooltip-cover.js";
  import { getTooltipGroup } from "../utils/tooltip-group.js";
  import { createTooltipHandoff } from "../utils/tooltip-handoff.js";
  import ButtonSkeleton from "./ButtonSkeleton.svelte";

  const insideModal = getContext(MODAL_CONTEXT_KEY);
  const actionSetSize = getContext("carbon:ActionSet")?.size;
  /** @type {undefined | import("svelte/store").Readable<undefined | "xs" | "sm" | "md" | "xl">} */
  const formSize = getContext(FORM_SIZE_CONTEXT_KEY);
  // Inside an `InputGroup`, match the height of the group's fields.
  const inputGroupSize = getContext("carbon:InputGroup")?.buttonSize;

  const hasIcon = $derived(Boolean(Icon || iconChildren));
  const hasIconOnly = $derived(hasIcon && (iconOnly ?? !children));

  // `loading` blocks clicks and sets aria-busy at once. Only the spinner, and
  // the disabled look that comes with it, wait for `loadingDelay`. With no
  // delay the spinner follows `loading` exactly.
  let showSpinner = $state(untrack(() => loading));
  const loadingIndicator = createLoadingIndicator((shown) => {
    showSpinner = shown;
  });
  $effect.pre(() => {
    loadingIndicator(loading, loadingDelay);
  });

  const { position: effectiveTooltipPosition, alignment: effectiveTooltipAlignment } =
    $derived(tooltipPlacement(tooltipAlign, tooltipPosition, tooltipAlignment));

  // Without an iconDescription there is nothing to show in a tooltip or
  // announce as the accessible name via the assistive-text span; skip the
  // whole tooltip apparatus and let the consumer's own aria-label/
  // aria-labelledby (passed through rest props) carry accessibility instead.
  // While loading, the spinner's <title> carries the accessible name
  // instead, so the tooltip is suppressed to avoid reading it twice.
  const hasTooltipContent = $derived(
    hasIconOnly && Boolean(iconDescription) && !showSpinner,
  );
  // Set for one open when the in-place tooltip turns out to be cut off by
  // a box around it (a scrolling panel, a DataTable): it shows in a portal
  // instead. Only when `portalTooltip` is left unset.
  let portalWhenClipped = $state(false);
  const effectivePortalTooltip = $derived(
    portalTooltip === undefined
      ? !!insideModal || portalWhenClipped
      : portalTooltip,
  );
  const usePortal = $derived(
    hasTooltipContent && !hideTooltip && effectivePortalTooltip,
  );
  const hasTooltip = $derived(hasTooltipContent && !hideTooltip && !usePortal);

  // Warm-handoff hover/focus scheduling: only one tooltip can be open at a
  // time. When another tooltip claims the active slot, this one closes
  // immediately — preventing overlapping tooltips (e.g. Pagination's
  // adjacent buttons).
  const tooltipHandoff = createTooltipHandoff({ group: getTooltipGroup() });
  const tooltipActive = tooltipHandoff.active;
  const tooltipOthersActive = tooltipHandoff.hidden;
  const tooltipInstant = tooltipHandoff.instant;

  let hovered = $state(false);
  let focused = $state(false);
  // Set by Escape. The tooltip stays hidden while the button keeps hover
  // or focus, until the next pointer enter or focus (WCAG 1.4.13).
  let dismissed = $state(false);
  // CSS `:hover` shows the inline tooltip, so the hidden class holds it back
  // while a hover waits out the group's enter delay, as TooltipIcon's does.
  // A warm handoff from a neighbor opens it at once. Before hydration, and
  // on the server, CSS alone shows it.
  let tooltipShown = $state(false);

  const portalOpen = $derived(
    usePortal &&
      !disabled &&
      !dismissed &&
      (hovered || focused) &&
      $tooltipActive,
  );
  // `tooltipShown` holds through the leave delay, so the pointer can move
  // onto the tooltip.
  const inlineOpen = $derived(
    hasTooltip && !disabled && !dismissed && tooltipShown && $tooltipActive,
  );

  // The in-place tooltip is laid out while hidden, so it measures where it
  // shows. Effects run after the DOM update, so the swap lands before paint.
  $effect(() => {
    if (inlineOpen) untrack(portalIfClipped);
  });
  // Back in place for the next open to measure, and closed there too:
  // the portal path never clears `tooltipShown`.
  $effect(() => {
    if (!inlineOpen && !portalOpen) untrack(endClippedOpen);
  });

  function portalIfClipped() {
    const tooltip = ref?.querySelector(":scope > .bx--assistive-text");
    if (portalTooltip !== undefined || !inlineOpen || !tooltip) return;
    if (clippedBy(tooltip)) portalWhenClipped = true;
  }

  function endClippedOpen() {
    if (!portalWhenClipped) return;
    portalWhenClipped = false;
    tooltipShown = false;
  }

  function dismissPortalTooltip() {
    tooltipHandoff.cancel();
    hovered = false;
    focused = false;
    tooltipHandoff.release();
  }

  // Dismiss the portalled tooltip when an ancestor modal closes (mirrors
  // CopyButton).
  $effect(() => {
    if (usePortal && ref) return observeModalClose(ref, dismissPortalTooltip);
  });

  const tooltipHidden = $derived(
    hasTooltipContent && !hideTooltip && $tooltipOthersActive,
  );

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLElement }} event */
  function handleMouseenter(event) {
    if (hasTooltip) {
      hovered = true;
      dismissed = false;
      tooltipHandoff.scheduleEnter(() => {
        tooltipShown = true;
      });
    } else if (usePortal && !disabled) {
      dismissed = false;
      tooltipHandoff.scheduleEnter(() => {
        hovered = true;
      });
    }
    onmouseenter?.(event);
  }

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLElement }} event */
  function handleMouseleave(event) {
    if (hasTooltip) {
      hovered = false;
      tooltipHandoff.scheduleLeave(() => {
        if (focused) return;
        tooltipShown = false;
        tooltipHandoff.release();
      });
    } else if (usePortal) {
      handlePortalMouseLeave();
    }
    onmouseleave?.(event);
  }

  function handlePortalMouseLeave() {
    tooltipHandoff.scheduleLeave(() => {
      hovered = false;
      if (!focused) tooltipHandoff.release();
    });
  }

  // The pointer moved onto the portalled tooltip: keep it open.
  function handleTooltipMouseenter() {
    if (portalOpen) tooltipHandoff.cancel();
  }

  // The pointer moved onto a part of the tooltip that covers another
  // control, such as the next button in a row: close at once, so the
  // pointer and the next click reach that control. Hidden as by Escape
  // until the next pointer enter or focus.
  function handleTooltipCover() {
    tooltipHandoff.cancel();
    dismissed = true;
    tooltipShown = false;
    if (usePortal) hovered = false;
    tooltipHandoff.release();
  }

  // Focus shows the tooltip at once, without the fade-in. Focus the
  // library moved here itself, such as a modal's first focus, did not ask
  // for the tooltip. Treat it as dismissed, so Escape reaches the modal,
  // until the next pointer enter or focus.
  /** @param {FocusEvent & { currentTarget: EventTarget & HTMLElement }} event */
  function handleFocus(event) {
    if ((hasTooltip || usePortal) && !disabled) {
      focused = true;
      dismissed = !tooltipHandoff.claimFocus(ref);
      tooltipShown = !dismissed;
    }
    onfocus?.(event);
  }

  /** @param {FocusEvent & { currentTarget: EventTarget & HTMLElement }} event */
  function handleBlur(event) {
    onblur?.(event);
    if (!(hasTooltip || usePortal)) return;
    focused = false;
    if (hovered) return;
    tooltipShown = false;
    tooltipHandoff.release();
  }

  // Listens on `window` in the capture phase, as TooltipIcon does, so a
  // hovered tooltip also hides while focus is elsewhere, and an ancestor
  // such as a Modal doesn't also see the Escape that hid it.
  /** @param {Event} event */
  function handleKeydown(event) {
    const keyboardEvent = /** @type {KeyboardEvent} */ (event);
    if (keyboardEvent.key !== "Escape" || !(portalOpen || inlineOpen)) return;
    // Escape that cancels an IME composition is not a dismissal.
    if (isImeComposition(keyboardEvent)) return;
    event.stopPropagation();
    dismissed = true;
    tooltipShown = false;
    tooltipHandoff.dismiss();
  }

  const portalGaps = $derived(
    iconTooltipPortalGaps(effectiveTooltipPosition, effectiveTooltipAlignment),
  );

  onMount(() => {
    return () => {
      tooltipHandoff.cancel();
      loadingIndicator.cancel();
      tooltipHandoff.release();
    };
  });

  // Native `disabled` is reserved for the `disabled` prop. `loading` alone
  // never sets it: disabling the element the user just clicked steals focus
  // (browsers move it to <body>), which is jarring for keyboard/screen
  // reader users mid-submit. Loading instead keeps the element focusable,
  // marks it with aria-disabled, and blocks the click itself (see
  // handleClick) — the same pattern Modal's primaryButtonLoading already
  // uses, minus the focus loss.
  const isDisabled = $derived(Boolean(disabled));
  const isVisuallyDisabled = $derived(isDisabled || showSpinner);
  const effectiveSize = $derived(
    badge
      ? "lg"
      : (normalizeSize(size, BUTTON_SIZE_ALIASES) ??
          $actionSetSize ??
          $inputGroupSize ??
          formButtonSize($formSize) ??
          "default"),
  );
  const isLink = $derived(Boolean(href) && !isDisabled);
  const iconStyle = $derived(hasIconOnly ? "margin-inline-start: 0" : undefined);
  const iconProps = $derived({
    class: "bx--btn__icon",
    "aria-hidden": /** @type {const} */ ("true"),
    style: iconStyle,
  });

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLElement }} event */
  function handleClick(event) {
    if (loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    onclick?.(event);
  }

  // Pressing the shortcut clicks the button, so it takes the same path as a
  // pointer: `onclick`, a form submit, a link's navigation.
  /** @param {KeyboardEvent} event */
  function runShortcut(event) {
    const detail = cancelable({ event });
    onshortcut?.(detail);
    if (!detail.defaultPrevented) ref?.click();
  }

  const shortcutParams = $derived({ shortcut, run: runShortcut });
  const hasShortcutHint = $derived(Boolean(shortcut) && !hasIconOnly);
  // Without an icon for the spinner to replace, it takes the keys' place
  // instead, and the hidden keys keep the button's width.
  const spinnerInShortcut = $derived(hasShortcutHint && !hasIcon);

  const buttonClass = $derived([
    "bx--btn",
    expressive && "bx--btn--expressive",
    effectiveSize === "xs" && "bx--btn--xs",
    effectiveSize === "small" && "bx--btn--sm",
    effectiveSize === "field" && "bx--btn--field",
    effectiveSize === "lg" && "bx--btn--lg",
    effectiveSize === "xl" && "bx--btn--xl",
    kind && `bx--btn--${kind}`,
    fullWidth && "bx--btn--full-width",
    isVisuallyDisabled && "bx--btn--disabled",
    hasIconOnly && "bx--btn--icon-only",
    hasShortcutHint && "bx--btn--shortcut",
    spinnerInShortcut && "bx--btn--shortcut-end",
    hasShortcutHint && !spinnerInShortcut && "bx--btn--shortcut-icon",
    hasTooltip && "bx--tooltip__trigger",
    hasTooltip && "bx--tooltip--a11y",
    hasTooltip &&
      effectiveTooltipPosition &&
      `bx--btn--icon-only--${effectiveTooltipPosition}`,
    hasTooltip &&
      effectiveTooltipAlignment &&
      `bx--tooltip--align-${effectiveTooltipAlignment}`,
    hasTooltip &&
      (tooltipHidden ||
        (dismissed && (hovered || focused)) ||
        (hovered && !tooltipShown)) &&
      "bx--tooltip--hidden",
    inlineOpen && "bx--tooltip--visible",
    hasTooltip && $tooltipInstant && "bx--tooltip--instant",
    hasIconOnly && isSelected && kind === "ghost" && "bx--btn--selected",
    className,
  ]);

  const ownProps = $derived({
    type: isLink ? undefined : type,
    tabindex,
    disabled: isDisabled ? true : undefined,
    href: isLink ? href : undefined,
    target,
    rel: isLink ? (rel ?? resolveLinkRel(target)) : rel,
    "aria-pressed":
      hasIconOnly && kind === "ghost" && !href ? isSelected : undefined,
    "aria-busy": loading || undefined,
    "aria-keyshortcuts": shortcut
      ? ariaKeyShortcuts(shortcut, { apple: $applePlatform }) || undefined
      : undefined,
    "aria-disabled": loading || undefined,
    style,
  });
  // What a `child` snippet spreads on its own element.
  const childProps = $derived({
    ...ownProps,
    ...rest,
    class: buttonClass,
    onclick: handleClick,
    onfocus,
    onblur,
    onmouseenter,
    onmouseleave,
  });
</script>

{#snippet shortcutKeys()}
  {#if shortcut}<span class="bx--btn__tooltip-shortcut" aria-hidden="true"
      ><Kbd {shortcut} variant="muted" /></span
    >{/if}
{/snippet}

{#snippet spinner(/** @type {string | undefined} */ spinnerStyle)}
  <Loading
    small
    withOverlay={false}
    description={loadingDescription}
    class="bx--btn__loading"
    style={spinnerStyle}
  />
{/snippet}

{#snippet content()}
  {#if hasIconOnly && iconDescription && !showSpinner}
    <span class="bx--assistive-text">{iconDescription}{@render shortcutKeys()}</span
    >
  {/if}
  {#if !hasIconOnly}
    {@render children?.()}
    {#if shortcut}
      <span class="bx--btn__shortcut">
        {#if showSpinner && spinnerInShortcut}
          {@render spinner(undefined)}
        {/if}
        <Kbd {shortcut} variant="muted" aria-hidden="true" />
      </span>
    {/if}
  {/if}
  {#if showSpinner && !spinnerInShortcut}
    {@render spinner(iconStyle)}
  {:else if iconChildren}
    {@render iconChildren({ props: iconProps })}
  {:else if Icon}
    <Icon {...iconProps} />
  {/if}
{/snippet}

{#snippet element()}
  <svelte:element
    this={isLink ? "a" : "button"}
    bind:this={ref}
    {@attach dismiss(() => ({
      enabled: portalOpen || inlineOpen,
      type: "keydown",
      handler: handleKeydown,
      options: { capture: true },
    }))}
    use:keyboardShortcut={shortcutParams}
    use:ignoreTooltipClicks
    use:closeOverControls={{ onCover: handleTooltipCover }}
    {...ownProps}
    {...rest}
    class={buttonClass}
    onclick={handleClick}
    onfocus={handleFocus}
    onblur={handleBlur}
    onmouseenter={handleMouseenter}
    onmouseleave={handleMouseleave}
  >
    {@render content()}
  </svelte:element>
{/snippet}

{#if skeleton}
  <ButtonSkeleton
    {href}
    size={effectiveSize}
    {...rest}
    class={className}
    style={[hasIconOnly && "width: 3rem;", style].filter(Boolean).join(" ") ||
      undefined}
    {onclick}
    {onfocus}
    {onblur}
    {onmouseenter}
    {onmouseleave}
  />
{:else if child}
  {@render child({ props: childProps })}
{:else if badge}
  <div class="bx--btn__badge-wrapper">
    {@render element()}
    {@render badge()}
  </div>
{:else}
  {@render element()}
{/if}

{#if usePortal}
  <PortalTooltip
    anchor={ref}
    direction={effectiveTooltipPosition}
    open={portalOpen}
    text={iconDescription}
    tooltipType="icon"
    intrinsicAlign={effectiveTooltipAlignment}
    horizontalGapLeft={portalGaps.horizontalGapLeft}
    horizontalGapRight={portalGaps.horizontalGapRight}
    gapTop={portalGaps.gapTop}
    gapBottom={portalGaps.gapBottom}
    verticalAlignOffsetLeft={portalGaps.verticalAlignOffsetLeft}
    verticalAlignOffsetRight={portalGaps.verticalAlignOffsetRight}
    on:mouseenter={handleTooltipMouseenter}
    on:mouseleave={handlePortalMouseLeave}
    on:cover={handleTooltipCover}
    >{iconDescription}{@render shortcutKeys()}</PortalTooltip
  >
{/if}
