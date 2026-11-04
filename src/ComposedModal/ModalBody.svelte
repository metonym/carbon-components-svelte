<script>
  /**
   * @restProps {div}
   */
  let {
    /** Set to `true` if the modal contains form elements */
    hasForm = false,

    /** Set to `true` if the modal contains scrolling content */
    hasScrollingContent = false,

    /**
     * Obtain a reference to the top-level HTML element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * The body content.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {string | undefined | null} */
    id = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-label": ariaLabel = undefined,

    /** @type {string | undefined | null} */
    "aria-labelledby": ariaLabelledby = undefined,

    /** @type {import("svelte/elements").FocusEventHandler<HTMLDivElement> | undefined | null} */
    onfocusin = undefined,

    ...rest
  } = $props();

  import { onMount, setContext } from "svelte";
  import { readable } from "svelte/store";
  import { LAYER_CONTEXT_KEY } from "../constants/context-keys.js";
  import { scrollIntoViewWithin } from "../utils/scroll-into-view-within.js";
  import {
    getComposedModal,
    hasComposedModal,
  } from "./composed-modal-context.js";

  const modal = hasComposedModal() ? getComposedModal() : undefined;

  // As in v11, the body is a layer at level 1, so a `Layer` inside sits at 2.
  setContext(LAYER_CONTEXT_KEY, readable(2));

  // Give the body an id ComposedModal can reference from `aria-describedby`
  // in alert mode. A consumer `id` wins and is reported instead.
  const resolvedId = $derived(id ?? modal?.ids.body);
  $effect.pre(() => {
    modal?.setBodyId(resolvedId ?? undefined);
  });
  onMount(() => () => modal?.setBodyId(undefined));

  // Name the region with ModalHeader's label/title heading when the
  // consumer hasn't already supplied their own aria-label/aria-labelledby.
  const regionLabelledby = $derived(
    ariaLabelledby ??
      (ariaLabel
        ? undefined
        : modal?.label
          ? modal.ids.label
          : modal?.title
            ? modal.ids.title
            : undefined),
  );
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  bind:this={ref}
  id={resolvedId}
  tabindex={hasScrollingContent ? 0 : undefined}
  role={hasScrollingContent ? "region" : undefined}
  aria-label={ariaLabel}
  aria-labelledby={hasScrollingContent ? regionLabelledby : ariaLabelledby}
  {...rest}
  class={[
    "bx--modal-content",
    "bx--layer-two",
    hasForm && "bx--modal-content--with-form",
    hasScrollingContent && "bx--modal-scroll-content",
    className,
  ]}
  onfocusin={(event) => {
    // Keep a newly-focused element (e.g. via Tab) from being hidden under
    // the scroll gradient at the bottom of the content area.
    if (event.target instanceof HTMLElement) {
      scrollIntoViewWithin(event.target, ".bx--modal-content");
    }
    onfocusin?.(event);
  }}
>
  {@render children?.()}
</div>
{#if hasScrollingContent}
  <div class="bx--modal-content--overflow-indicator"></div>
{/if}
