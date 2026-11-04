<script>
  /**
   * @restProps {a | div}
   */
  let {
    /**
     * Set the `href` to use an anchor link.
     * @type {string | undefined}
     */
    href = undefined,

    /**
     * Specify the size of button skeleton.
     * Falls back to the height of a parent `Form`'s size, as Button does.
     * Accepts the same Carbon v11 aliases as Button.
     * @type {"default" | "field" | "small" | "xs" | "lg" | "xl" | "sm" | "md" | "2xl" | undefined}
     * @default "default"
     */
    size = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    target = undefined,

    ...rest
  } = $props();

  import { getContext } from "svelte";
  import { FORM_SIZE_CONTEXT_KEY } from "../constants/context-keys.js";
  import { formButtonSize } from "../utils/form-button-size.js";
  import { resolveLinkRel } from "../utils/link-rel.js";
  import { BUTTON_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";

  /** @type {undefined | import("svelte/store").Readable<undefined | "xs" | "sm" | "md" | "xl">} */
  const formSize = getContext(FORM_SIZE_CONTEXT_KEY);
  const effectiveSize = $derived(
    normalizeSize(size, BUTTON_SIZE_ALIASES) ??
      formButtonSize($formSize) ??
      "default",
  );
  const skeletonClass = $derived([
    "bx--skeleton",
    "bx--btn",
    effectiveSize === "field" && "bx--btn--field",
    effectiveSize === "xs" && "bx--btn--xs",
    effectiveSize === "small" && "bx--btn--sm",
    effectiveSize === "lg" && "bx--btn--lg",
    effectiveSize === "xl" && "bx--btn--xl",
    className,
  ]);
</script>

{#if href}
  <a
    {href}
    {target}
    rel={resolveLinkRel(target)}
    role="button"
    tabindex="-1"
    aria-hidden="true"
    {...rest}
    class={skeletonClass}
  >
    {""}
  </a>
{:else}
  <div {...rest} class={skeletonClass}></div>
{/if}
