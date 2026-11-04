<script>
  /**
   * @restProps {span}
   */
  let {
    /** @type {"xs" | "sm" | "default" | "lg" | "md"} */
    size = "default",

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();
</script>

<span
  {...rest}
  class={[
    "bx--tag",
    size === "xs" && "bx--tag--xs",
    size === "sm" && "bx--tag--sm",
    size === "lg" && "bx--tag--lg",
    "bx--skeleton",
    className,
  ]}
></span>
