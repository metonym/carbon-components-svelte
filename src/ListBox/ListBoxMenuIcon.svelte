<script>
  /**
   * @restProps {div}
   * @typedef {"close" | "open"} ListBoxMenuIconTranslationId
   */
  let {
    /** Set to `true` to open the list box menu icon */
    open = false,

    /**
     * Override the default translation ids.
     * @type {(id: ListBoxMenuIconTranslationId) => string}
     */
    translateWithId = (/** @type {ListBoxMenuIconTranslationId} */ id) =>
      defaultTranslations[id],

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLDivElement> | undefined | null} */
    onclick = undefined,

    ...rest
  } = $props();

  /** Default translation ids */
  export const translationIds = /** @type {const} */ ({
    close: "close",
    open: "open",
  });

  import ChevronDown from "../icons/ChevronDown.svelte";

  const defaultTranslations = {
    [translationIds.close]: "Close menu",
    [translationIds.open]: "Open menu",
  };

  const translationId = $derived(
    open ? translationIds.close : translationIds.open,
  );
  const description = $derived(
    translateWithId?.(translationId) ?? defaultTranslations[translationId],
  );
</script>

<div
  {...rest}
  class={[
    "bx--list-box__menu-icon",
    open && "bx--list-box__menu-icon--open",
    className,
  ]}
  onclick={(event) => {
    event.preventDefault();
    onclick?.(event);
  }}
>
  <ChevronDown aria-label={description} title={description} />
</div>
