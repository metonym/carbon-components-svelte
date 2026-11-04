<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   */

  /**
   * @restProps {a}
   */
  let {
    /**
     * Specify the size of the link.
     * @type {"sm" | "md" | "lg"}
     */
    size = "md",

    /**
     * Specify the href value.
     * @type {string | undefined}
     */
    href = undefined,

    /** Set to `true` to use the inline variant */
    inline = false,

    /**
     * Specify the icon to render.
     * `inline` must be `false`.
     * @type {Icon | undefined}
     */
    icon: Icon = undefined,

    /** Set to `true` to disable the link */
    disabled = false,

    /** Set to `true` to allow visited styles */
    visited = false,

    /**
     * Set to `true` to inherit the surrounding text color instead of the
     * link color. Use for inline links within body text.
     */
    muted = false,

    /**
     * Obtain a reference to the top-level HTML element.
     * @type {null | HTMLAnchorElement}
     */
    ref = $bindable(null),

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    target = undefined,

    /** @type {string | undefined | null} */
    rel = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLAnchorElement> | undefined | null} */
    onclick = undefined,

    ...rest
  } = $props();

  import { resolveLinkRel } from "../utils/link-rel.js";

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement }} event */
  function handleClick(event) {
    // A disabled link never reaches the consumer's handler or an ancestor.
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onclick?.(event);
  }
</script>

<!-- No whitespace after the children: an inline link would underline it. -->
<!-- Whitespace between these nodes renders as text -->
<!-- prettier-ignore -->
<a
  bind:this={ref}
  role={disabled ? "link" : undefined}
  aria-disabled={disabled ? "true" : undefined}
  {...rest}
  class={[
    "bx--link",
    disabled && "bx--link--disabled",
    inline && "bx--link--inline",
    visited && "bx--link--visited",
    muted && "bx--link--muted",
    !disabled && size === "sm" && "bx--link--sm",
    !disabled && size === "lg" && "bx--link--lg",
    className,
  ]}
  {target}
  rel={rel ?? (disabled ? undefined : resolveLinkRel(target))}
  href={disabled ? undefined : href}
  onclick={handleClick}
>{@render children?.()}{#if !inline && Icon}<span class="bx--link__icon"><Icon /></span>{/if}</a>
