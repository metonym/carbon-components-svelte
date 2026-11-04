<script>
  /**
   * @restProps {button}
   */

  const fallbackId = $props.id();

  let {
    /** Set to `true` for the complete variant */
    complete = false,

    /**
     * Set to `true` to use the current variant. Inside a
     * `ProgressIndicator`, the indicator's `currentIndex` or `currentId`
     * decides, and this follows it.
     */
    current = $bindable(false),

    /** Set to `true` to disable the progress step */
    disabled = false,

    /** Set to `true` to indicate an invalid state */
    invalid = false,

    /** Specify the step description */
    description = "",

    /** Specify the step label */
    label = "",

    /** Specify the step secondary label */
    secondaryLabel = "",

    /**
     * Set an id for the step's `<li>`.
     * @type {string}
     */
    id = fallbackId,

    /**
     * Custom step icon, replacing the status icon.
     * @type {import("svelte").Snippet<[{ complete: boolean; current: boolean; invalid: boolean; description: string }]> | undefined}
     */
    icon = undefined,

    /**
     * Custom label element, replacing `label`. Spread `props` on it to keep
     * the label styles.
     * @type {import("svelte").Snippet<[{ props: { class: string } }]> | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {import("svelte/elements").MouseEventHandler<HTMLButtonElement> | undefined | null} */
    onclick = undefined,

    ...rest
  } = $props();

  import { onMount, untrack } from "svelte";
  import CheckmarkOutline from "../icons/CheckmarkOutline.svelte";
  import CircleDash from "../icons/CircleDash.svelte";
  import Incomplete from "../icons/Incomplete.svelte";
  import Warning from "../icons/Warning.svelte";
  import { titleWhenTruncated } from "../utils/title-when-truncated.js";
  import {
    getProgressIndicator,
    hasProgressIndicator,
  } from "./progress-indicator-context.js";

  const ctx = hasProgressIndicator() ? getProgressIndicator() : undefined;

  // Register while initializing, in render order, so the server and the
  // first render know this step. Later changes go through `patch`.
  untrack(() => ctx?.add({ id, complete, disabled }));
  onMount(() => () => ctx?.remove(id));
  $effect.pre(() => {
    const patch = { complete, disabled };
    untrack(() => ctx?.patch(id, patch));
  });

  const isCurrent = $derived(ctx ? ctx.currentStepId === id : current);

  // Inside an indicator, `current` follows it for `bind:current`.
  $effect.pre(() => {
    const next = isCurrent;
    untrack(() => {
      if (current !== next) current = next;
    });
  });

  const status = $derived(
    invalid ? "invalid" : complete ? "complete" : undefined,
  );
  const unclickable = $derived(
    isCurrent || !complete || !!ctx?.preventChangeOnClick,
  );

  /** @param {MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }} event */
  function handleClick(event) {
    onclick?.(event);
    if (!complete || isCurrent) return;
    ctx?.change(id);
  }
</script>

<li
  {id}
  class={[
    "bx--progress-step",
    isCurrent && "bx--progress-step--current",
    complete && "bx--progress-step--complete",
    !complete && !isCurrent && "bx--progress-step--incomplete",
    disabled && "bx--progress-step--disabled",
  ]}
>
  <button
    type="button"
    {disabled}
    aria-disabled={disabled}
    aria-current={isCurrent ? "step" : undefined}
    tabindex={disabled ? -1 : 0}
    {...rest}
    class={[
      "bx--progress-step-button",
      unclickable && "bx--progress-step-button--unclickable",
      className,
    ]}
    use:titleWhenTruncated={{ measure: ".bx--progress-label" }}
    onclick={handleClick}
  >
    {#if icon}
      {@render icon({ complete, current: isCurrent, invalid, description })}
    {:else if invalid}
      <Warning class="bx--progress__warning" title={description} />
    {:else if isCurrent}
      <Incomplete title={description} />
    {:else if complete}
      <CheckmarkOutline title={description} />
    {:else}
      <CircleDash title={description} />
    {/if}
    <div class="bx--progress-text">
      {#if children}
        {@render children({ props: { class: "bx--progress-label" } })}
      {:else}
        <span class="bx--progress-label">{label}</span>
      {/if}
      {#if secondaryLabel}
        <span class="bx--progress-optional">{secondaryLabel}</span>
      {/if}
    </div>
    {#if status}
      <span class="bx--visually-hidden"
        >, {ctx ? ctx.statusText(status) : status}</span
      >
    {/if}
    <span class="bx--progress-line"></span>
  </button>
</li>
