<script>
  /**
   * @restProps {div}
   */
  let {
    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();
</script>

<div
  {...rest}
  class={[
    "bx--form-item",
    "bx--checkbox-wrapper",
    "bx--checkbox-label",
    className,
  ]}
>
  <span class="bx--checkbox-label-text bx--skeleton"></span>
</div>
