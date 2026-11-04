<script>
  /**
   * @restProps {div}
   */
  let {
    /**
     * Set the size of the skeleton to match the field it stands in for.
     * Inherits the parent `Form` size when unset.
     * Also accepts Carbon v11's `"md"` (the 40px default, which overrides a
     * `Form` size). `"lg"` and `"xl"` are both 48px.
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

  /** @type {undefined | import("svelte/store").Readable<undefined | "xs" | "sm" | "md" | "xl">} */
  const formSize = getContext(FORM_SIZE_CONTEXT_KEY);
  const effectiveSize = $derived(size ?? $formSize);
</script>

<div {...rest} class={["bx--form-item bx--list-box__wrapper", className]}>
  {#if !hideLabel}
    <span class="bx--label bx--skeleton"></span>
  {/if}
  <div
    class={[
      "bx--skeleton bx--combo-box bx--list-box",
      effectiveSize === "xs" && "bx--list-box--xs",
      effectiveSize === "sm" && "bx--list-box--sm",
      effectiveSize === "lg" && "bx--list-box--lg",
      effectiveSize === "xl" && "bx--list-box--xl",
    ]}
  >
    <div role="button" class="bx--list-box__field">
      <span class="bx--list-box__label"></span>
    </div>
  </div>
</div>
