<script>
  /**
   * @restProps {div}
   */

  const fallbackId = $props.id();

  let {
    /**
     * Specify the toggle size.
     * Also accepts Carbon v11's `"md"` (`"default"`).
     * @type {"default" | "sm" | "md"}
     */
    size = "default",

    /**
     * Specify the label text, or a snippet.
     * @type {string | import("svelte").Snippet}
     */
    labelText = "",

    /** Set to `true` to visually hide the label text */
    hideLabel = false,

    /**
     * Set an id for the input element
     * @type {string}
     */
    id = fallbackId,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    ...rest
  } = $props();
</script>

{#snippet content(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<div {...rest} class={["bx--form-item", className]}>
  <input
    type="checkbox"
    {id}
    class={[
      "bx--toggle",
      "bx--toggle-input",
      size === "sm" && "bx--toggle-input--small",
      "bx--skeleton",
    ]}
  />
  <label
    aria-label={labelText && !hideLabel
      ? undefined
      : typeof labelText === "string" && labelText
        ? labelText
        : (ariaLabel ?? "Toggle is loading")}
    for={id}
    class="bx--toggle-input__label bx--skeleton"
  >
    {#if labelText && !hideLabel}
      <div>{@render content(labelText)}</div>
    {/if}
    <span
      class="bx--toggle__switch"
      style:margin-top={hideLabel ? 0 : undefined}
    >
      <span class="bx--toggle__text--left"></span>
    </span>
  </label>
</div>
