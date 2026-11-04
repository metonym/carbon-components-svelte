<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @restProps {span | button | a}
   */

  const uid = $props.id();

  let {
    /**
     * Specify the size of the avatar.
     * Defaults to `"md"`, or to the `size` of a parent `UserAvatarGroup`.
     * @type {"sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /**
     * Specify the background color rendered behind the initials or icon.
     * Set to `"auto"` to pick a stable color from `name` (or `initials`).
     * @type {"auto" | "red" | "magenta" | "purple" | "blue" | "cyan" | "teal" | "green" | "gray" | "cool-gray" | "warm-gray"}
     */
    backgroundColor = "gray",

    /**
     * Set to `"strong"` for a fill that stands further from the page: the 80
     * step in light themes and the 30 step in dark themes, as in Carbon's
     * `order-7` to `order-12` colors. Applies to every `backgroundColor`,
     * including `"auto"`.
     * @type {"default" | "strong"}
     */
    shade = "default",

    /**
     * Specify the user's full name. Initials are derived from the name when `initials` is not set.
     * Also the default alt text for `image`. Set `imageDescription=""` to mark the
     * image decorative when the name is already visible next to the avatar.
     * @type {string | undefined}
     */
    name = undefined,

    /**
     * Specify the initials to display. Takes priority over initials derived from `name`.
     * @type {string | undefined}
     */
    initials = undefined,

    /**
     * Specify an image source to render a photo.
     * Takes priority over the icon and initials.
     * If the image fails to load, the avatar falls back to the icon or initials
     * and calls `onimageerror`.
     * @type {string | undefined}
     */
    image = undefined,

    /**
     * Specify alternative text for the image.
     * Falls back to `imageAttributes.alt`, then `name`. Without either, the
     * image is marked decorative (`alt=""`).
     * Set to `""` to mark the image decorative when the name is already visible
     * next to the avatar, which avoids announcing it twice.
     * @type {string | undefined}
     */
    imageDescription = undefined,

    /**
     * Pass additional attributes through to the image element
     * (for example `loading`, `srcset`, or `referrerPolicy`).
     * Does not replace `image` or `imageDescription`. Rest props stay on the host.
     * @type {Record<string, string> | undefined}
     */
    imageAttributes = undefined,

    /**
     * Specify the icon to render. Falls back to a default user icon.
     * @type {Icon | undefined}
     */
    icon: AvatarIcon = undefined,

    /**
     * Specify a presence status. Renders a status indicator in the badge
     * position. A `badge` snippet overrides it.
     * @type {"online" | "away" | "busy" | "offline" | undefined}
     */
    status = undefined,

    /**
     * Specify the tooltip text. When set, the avatar is wrapped in a tooltip.
     * Do not combine with `interactive` or `href` — the tooltip trigger is already
     * focusable, and nesting an interactive avatar inside it is invalid.
     * @type {string | undefined}
     */
    tooltipText = undefined,

    /**
     * Set an id for the avatar element.
     * With `tooltipText`, the tooltip id derives from it as `{id}-tooltip`.
     * @type {string | undefined}
     */
    id = undefined,

    /**
     * Set the alignment of the tooltip relative to the avatar.
     * @type {"start" | "center" | "end"}
     */
    align = "center",

    /**
     * Set the direction of the tooltip relative to the avatar.
     * @type {"top" | "bottom"}
     */
    direction = "bottom",

    /**
     * Set to `false` to render the tooltip inline instead of in a floating portal.
     * The portal prevents the tooltip from being clipped by the avatar's `overflow: hidden`
     * frame or an `overflow: hidden` container such as a `Modal`.
     * @type {boolean}
     */
    portalTooltip = true,

    /**
     * Set to `true` to render a `button` element instead of a `span`.
     * Use when the avatar is a clickable control (for example, a custom profile menu
     * trigger). Prefer this over attaching `onclick` to a non-interactive `span`.
     * Ignored when `href` is set.
     */
    interactive = false,

    /**
     * Set an `href` to render an anchor element instead of a `span`.
     * Takes priority over `interactive`.
     * @type {string | undefined}
     */
    href = undefined,

    /**
     * Obtain a reference to the avatar HTML element.
     * @type {null | HTMLElement}
     */
    ref = $bindable(null),

    /**
     * Called when the `image` URL fails to load. The avatar then falls back
     * to the icon or initials.
     * @type {((detail: { image: string | undefined }) => void) | undefined}
     */
    onimageerror = undefined,

    /**
     * Custom avatar content, replacing the image, icon and initials.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /**
     * Overlay content at the bottom-right of the avatar, for example a
     * status dot or `BadgeIndicator`. Replaces the `status` indicator.
     * @type {import("svelte").Snippet | undefined}
     */
    badge = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-labelledby": ariaLabelledBy = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    /** @type {string | undefined} */
    "data-avatar-group-overflow": dataAvatarGroupOverflow = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import TooltipDefinition from "../TooltipDefinition/TooltipDefinition.svelte";
  import {
    getUserAvatarGroup,
    hasUserAvatarGroup,
  } from "../UserAvatarGroup/user-avatar-group-context.js";
  import User from "../icons/User.svelte";
  import { getAvatarBackgroundColor } from "../utils/avatar-color.js";
  import { getInitials } from "../utils/initials.js";

  // Inside a `UserAvatarGroup`, register with the group so it can count
  // avatars and hide those beyond its `max`. Registering while initializing
  // means the server and the first render already hide them.
  const group = hasUserAvatarGroup() ? getUserAvatarGroup() : undefined;
  if (group) {
    untrack(() => group.add({ id: uid, name }));
    onMount(() => () => group.remove(uid));
    $effect.pre(() => {
      const current = name;
      untrack(() => group.rename(uid, current));
    });
    // `ref` points at a new element when the root is swapped.
    $effect(() => {
      if (ref) group.setNode(uid, ref);
    });
  }

  // Avatars past the group's `max` are hidden; the group renders a "+N"
  // overflow avatar in their place.
  const groupOverflow = $derived(group?.isOverflow(uid) ?? false);
  // Fall back to the group's size, then to "md".
  const resolvedSize = $derived(size ?? group?.size ?? "md");
  const imageAlt = $derived(
    imageDescription ?? imageAttributes?.alt ?? name ?? "",
  );

  // `href` wins over `interactive`. When either is set, the avatar itself is
  // the focus target; it isn't nested inside TooltipDefinition's button.
  const isLink = $derived(typeof href === "string");
  const isButton = $derived(!isLink && interactive);
  const isInteractive = $derived(isLink || isButton);
  const avatarTag = $derived(isLink ? "a" : isButton ? "button" : "span");
  // TooltipDefinition always renders a focusable button trigger. Use it only
  // when the avatar stays a non-interactive span; its button then takes the
  // naming and description attributes.
  const useTooltipWrapper = $derived(!!tooltipText && !isInteractive);

  const glyphSize = { sm: 16, md: 20, lg: 24, xl: 32 };

  const avatarInitials = $derived(initials ?? getInitials(name));
  const resolvedBackgroundColor = $derived(
    backgroundColor === "auto"
      ? getAvatarBackgroundColor(name ?? initials ?? "")
      : backgroundColor,
  );
  const fill = $derived(
    shade === "strong"
      ? `${resolvedBackgroundColor}-strong`
      : resolvedBackgroundColor,
  );

  // Fall back to icon/initials when the photo URL fails. Comparing against
  // the failed URL means a new `image` value retries; returning to the failed
  // URL later retries too, since a different value replaced it in between.
  /** @type {string | undefined} */
  let failedImage = $state(undefined);
  $effect.pre(() => {
    const current = image;
    untrack(() => {
      if (failedImage !== undefined && current !== failedImage) {
        failedImage = undefined;
      }
    });
  });

  function handleImageError() {
    failedImage = image;
    onimageerror?.({ image });
  }

  const hasBadge = $derived(Boolean(badge) || Boolean(status));
</script>

{#snippet content()}
  {#if children}
    {@render children()}
  {:else if image && image !== failedImage}
    <img
      {...imageAttributes}
      src={image}
      alt={imageAlt}
      onerror={handleImageError}
    />
  {:else if AvatarIcon}
    <AvatarIcon size={glyphSize[resolvedSize]} />
  {:else if avatarInitials}
    <span class="bx--user-avatar__text">{avatarInitials}</span>
  {:else}
    <User size={glyphSize[resolvedSize]} />
  {/if}
{/snippet}

{#snippet badgeContent()}
  <span class="bx--user-avatar__badge">
    {#if badge}
      {@render badge()}
    {:else if status}
      <span
        class="bx--user-avatar__status"
        class:bx--user-avatar__status--online={status === "online"}
        class:bx--user-avatar__status--away={status === "away"}
        class:bx--user-avatar__status--busy={status === "busy"}
        class:bx--user-avatar__status--offline={status === "offline"}
        aria-hidden="true"
      ></span>
    {/if}
  </span>
{/snippet}

<!-- `named` puts the naming attributes on the avatar; inside the tooltip
     wrapper they go on its button instead. `markOverflow` marks the avatar
     as hidden past the group's `max` when nothing wraps it. -->
{#snippet avatar(
  /** @type {boolean} */ named,
  /** @type {boolean} */ markOverflow,
)}
  <svelte:element
    this={avatarTag}
    bind:this={ref}
    {id}
    {...rest}
    class={[
      "bx--user-avatar",
      `bx--user-avatar--${resolvedSize}`,
      `bx--user-avatar--${fill}`,
      isInteractive && "bx--user-avatar--interactive",
      className,
    ]}
    href={isLink ? href : undefined}
    type={isButton ? "button" : undefined}
    aria-label={named
      ? (ariaLabel ?? (isInteractive && name ? name : undefined))
      : undefined}
    aria-labelledby={named ? ariaLabelledBy : undefined}
    aria-describedby={named ? ariaDescribedBy : undefined}
    data-avatar-group-overflow={dataAvatarGroupOverflow}
    data-overflow={markOverflow && groupOverflow ? "true" : undefined}
  >
    {@render content()}
  </svelte:element>
{/snippet}

{#if useTooltipWrapper}
  <TooltipDefinition
    class="bx--user-avatar-tooltip"
    {tooltipText}
    {align}
    {direction}
    {portalTooltip}
    id={id === undefined ? undefined : `${id}-tooltip`}
    data-overflow={groupOverflow ? "true" : undefined}
    data-avatar-group-overflow={dataAvatarGroupOverflow}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
    aria-describedby={ariaDescribedBy}
  >
    {#if hasBadge}
      <span class="bx--user-avatar__badge-wrapper">
        {@render avatar(false, false)}
        {@render badgeContent()}
      </span>
    {:else}
      {@render avatar(false, false)}
    {/if}
  </TooltipDefinition>
{:else if hasBadge}
  <span
    class="bx--user-avatar__badge-wrapper"
    data-overflow={groupOverflow ? "true" : undefined}
    data-avatar-group-overflow={dataAvatarGroupOverflow}
  >
    {@render avatar(true, false)}
    {@render badgeContent()}
  </span>
{:else}
  {@render avatar(true, true)}
{/if}
