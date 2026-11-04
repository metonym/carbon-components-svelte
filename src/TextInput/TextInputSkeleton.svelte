<script>
  /**
   * @restProps {div}
   */
  let {
    /**
     * Set the size of the skeleton to match the field it stands in for.
     * Inherits the parent `Form` size when unset.
     * Also accepts Carbon v11's `"md"` (the 40px default, which overrides a
     * `Form` size) and `"lg"` (`"xl"`).
     * @type {"xs" | "sm" | "md" | "lg" | "xl" | undefined}
     */
    size = undefined,

    /** Set to `true` to hide the label text */
    hideLabel = false,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import { getContext } from "svelte";
  import { FORM_SIZE_CONTEXT_KEY } from "../constants/context-keys.js";
  import { FIELD_SIZE_ALIASES, normalizeSize } from "../utils/size-aliases.js";

  /** @type {undefined | import("svelte/store").Readable<undefined | "xs" | "sm" | "md" | "xl">} */
  const formSize = getContext(FORM_SIZE_CONTEXT_KEY);
  const effectiveSize = $derived(
    normalizeSize(size ?? $formSize, FIELD_SIZE_ALIASES),
  );
</script>

<div {...rest} class={["bx--form-item", className]}>
  {#if !hideLabel}
    <span class="bx--label bx--skeleton"></span>
  {/if}
  <div
    class={[
      "bx--skeleton",
      "bx--text-input",
      effectiveSize === "xs" && "bx--text-input--xs",
      effectiveSize === "sm" && "bx--text-input--sm",
      effectiveSize === "xl" && "bx--text-input--xl",
    ]}
  ></div>
</div>
