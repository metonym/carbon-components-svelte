<script>
  /** @extendProps {"./Link.svelte"} LinkProps */

  let {
    /**
     * Specify the assistive text announced to screen readers to
     * indicate that the link opens in a new tab.
     * Set to an empty string to opt out of the announcement.
     */
    assistiveText = "(opens in a new tab)",

    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    ...rest
  } = $props();

  import Launch from "../icons/Launch.svelte";
  import Link from "./Link.svelte";
</script>

<Link {...rest} target="_blank" icon={Launch}>
  {@render children?.()}
  {#if assistiveText}
    <span class="bx--visually-hidden">{assistiveText}</span>
  {/if}
</Link>
