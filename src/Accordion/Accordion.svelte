<script>
  /**
   * @restProps {ul}
   * @extendProps {"./AccordionSkeleton.svelte"} AccordionSkeletonProps
   */
  let {
    /**
     * Specify alignment of accordion item chevron icon.
     * @type {"start" | "end"}
     */
    align = "end",

    /**
     * Specify the size of the accordion.
     * Also accepts Carbon v11's `"md"` (the 40px default) and `"lg"` (`"xl"`).
     * @type {"sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /**
     * Set to `true` to remove the gutter around the accordion, aligning it flush with its container.
     * Has no effect when `align` is `"start"`.
     */
    flush = false,

    /** Set to `true` to disable the accordion */
    disabled = false,

    /** Set to `true` to display the skeleton state */
    skeleton = false,

    /**
     * Specify the expansion behavior of the accordion.
     * Set to `"single"` so that opening an item closes all other items.
     * @type {"single" | "multiple"}
     */
    type = "multiple",

    /**
     * The `AccordionItem`s.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import { FIELD_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";
  import AccordionSkeleton from "./AccordionSkeleton.svelte";
  import { setAccordion } from "./accordion-context.js";

  const effectiveSize = $derived(normalizeSize(size, FIELD_SIZE_ALIASES));

  /**
   * The item that owns the open slot when `type` is `"single"`.
   * @type {object | null}
   */
  let openKey = $state.raw(null);
  let mounted = $state(false);

  // Switching to `"single"` frees the slot; the first open item claims it
  // and the others close.
  let prevType = untrack(() => type);
  $effect.pre(() => {
    if (type === "single" && prevType !== "single") {
      untrack(() => (openKey = null));
    }
    prevType = type;
  });

  onMount(() => {
    mounted = true;
  });

  setAccordion({
    get disabled() {
      return disabled;
    },
    get type() {
      return type;
    },
    get openKey() {
      return openKey;
    },
    get mounted() {
      return mounted;
    },
    setOpenKey(key) {
      openKey = key;
    },
    release(key) {
      if (openKey === key) openKey = null;
    },
  });
</script>

{#if skeleton}
  <AccordionSkeleton
    {...rest}
    class={className}
    {align}
    size={effectiveSize}
    {flush}
  />
{:else}
  <ul
    {...rest}
    class={[
      "bx--accordion",
      align === "start" && "bx--accordion--start",
      align === "end" && "bx--accordion--end",
      effectiveSize === "sm" && "bx--accordion--sm",
      effectiveSize === "xl" && "bx--accordion--xl",
      flush && align !== "start" && "bx--accordion--flush",
      className,
    ]}
  >
    {@render children?.()}
  </ul>
{/if}
