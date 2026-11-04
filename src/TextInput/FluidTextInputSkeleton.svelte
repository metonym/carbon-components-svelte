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
  class={["bx--form-item", "bx--text-input--fluid__skeleton", className]}
>
  <span class="bx--label bx--skeleton"></span>
  <div class="bx--skeleton bx--text-input"></div>
</div>
