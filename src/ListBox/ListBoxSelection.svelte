<script>
  /**
   * @restProps {div}
   * @typedef {"clearAll" | "clearSelection"} ListBoxSelectionTranslationId
   */
  let {
    /**
     * Specify the number of selected items. When set, the selection renders
     * as a tag with the count; rest props go to the tag, and its close
     * button takes the naming and description attributes.
     * @type {number | undefined}
     */
    selectionCount = undefined,

    /** Set to `true` to disable the list box selection */
    disabled = false,

    /** Set to `true` to use the read-only variant */
    readonly = false,

    /**
     * Override the default translation ids.
     * @type {(id: ListBoxSelectionTranslationId) => string}
     */
    translateWithId = (/** @type {ListBoxSelectionTranslationId} */ id) =>
      defaultTranslations[id],

    /**
     * Obtain a reference to the clear button.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * Called when the user clears the selection, by click or Enter or Space.
     * @type {((detail: { trigger: "click" | "keydown" }) => void) | undefined}
     */
    onclear = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-labelledby": ariaLabelledBy = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    ...rest
  } = $props();

  /** Default translation ids */
  export const translationIds = /** @type {const} */ ({
    clearAll: "clearAll",
    clearSelection: "clearSelection",
  });

  import { getContext } from "svelte";
  import { on } from "svelte/events";
  import Close from "../icons/Close.svelte";

  const defaultTranslations = {
    [translationIds.clearAll]: "Clear all selected items",
    [translationIds.clearSelection]: "Clear selected item",
  };
  const ctx = getContext("carbon:MultiSelect");

  // Declare the node to a `MultiSelect`, and release that same node when it
  // goes away: `bind:this` has nulled `ref` by then.
  $effect(() => {
    const node = ref;
    if (!ctx || !node) return;
    ctx.declareRef({ key: "selection", ref: node });
    return () => ctx.releaseRef?.({ key: "selection", ref: node });
  });

  const translationId = $derived(
    selectionCount !== undefined && selectionCount > 1
      ? translationIds.clearAll
      : translationIds.clearSelection,
  );
  const description = $derived(
    translateWithId?.(translationId) ?? defaultTranslations[translationId],
  );

  // Listeners on the element, not delegated attributes, so they stop the
  // events before an ancestor's own listeners, such as the field's, see them.
  /** @param {HTMLElement} node */
  function stopEvents(node) {
    const offClick = on(node, "click", handleClick);
    const offKeydown = on(node, "keydown", handleKeydown);
    return () => {
      offClick();
      offKeydown();
    };
  }

  /** @param {MouseEvent} event */
  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled && !readonly) onclear?.({ trigger: "click" });
  }

  /** @param {KeyboardEvent} event */
  function handleKeydown(event) {
    event.stopPropagation();
    if (
      !disabled &&
      !readonly &&
      (event.key === "Enter" || event.key === " ")
    ) {
      onclear?.({ trigger: "keydown" });
    }
  }
</script>

{#if selectionCount !== undefined}
  <div
    aria-hidden={readonly ? "true" : undefined}
    {...rest}
    class={[
      "bx--tag bx--tag--filter bx--tag--high-contrast",
      disabled && "bx--tag--disabled",
      className,
    ]}
  >
    <span
      class="bx--tag__label"
      title={selectionCount?.toString()}
      aria-hidden={readonly || undefined}
    >
      {selectionCount}
    </span>
    <div
      bind:this={ref}
      role="button"
      tabindex="-1"
      class="bx--tag__close-icon"
      {@attach stopEvents}
      {disabled}
      aria-disabled={readonly || undefined}
      aria-label={ariaLabel ?? description}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-hidden={readonly || undefined}
      title={description}
    >
      <Close />
    </div>
  </div>
{:else}
  <div
    bind:this={ref}
    role="button"
    aria-label={ariaLabel ?? description}
    aria-labelledby={ariaLabelledBy}
    aria-describedby={ariaDescribedBy}
    title={description}
    tabindex="-1"
    aria-disabled={readonly ? "true" : undefined}
    {...rest}
    class={["bx--list-box__selection", className]}
    {@attach stopEvents}
  >
    <Close />
  </div>
{/if}
