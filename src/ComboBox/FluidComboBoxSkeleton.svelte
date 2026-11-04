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
    "bx--list-box__wrapper--fluid bx--list-box__wrapper--fluid--skeleton",
    className,
  ]}
>
  <div class="bx--skeleton bx--list-box">
    <span class="bx--list-box__label"></span>
    <div class="bx--list-box__field"></div>
  </div>
</div>
