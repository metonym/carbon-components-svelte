<script>
  /**
   * Internal: renders `children` with whether the option `optionId` is
   * under the menu's highlight cursor, without re-rendering every option.
   */
  let {
    /**
     * DOM id of the option this snippet belongs to (`{instanceId}-{item.id}`)
     * @type {string}
     */
    optionId,

    /**
     * @type {import("svelte").Snippet<[{ highlighted: boolean }]> | undefined}
     */
    children = undefined,
  } = $props();

  import { getContext } from "svelte";
  import { readable } from "svelte/store";
  import { HIGHLIGHT_CURSOR_KEY } from "./highlight-cursor.js";

  const cursor = getContext(HIGHLIGHT_CURSOR_KEY);
  const highlightedId = cursor?.highlightedId ?? readable(null);
</script>

{@render children?.({ highlighted: $highlightedId === optionId })}
