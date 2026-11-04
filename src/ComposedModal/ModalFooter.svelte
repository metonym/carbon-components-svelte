<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @restProps {div}
   */

  let {
    /** Specify the primary button text */
    primaryButtonText = "",

    /**
     * Specify the primary button icon.
     * @type {Icon | undefined}
     */
    primaryButtonIcon = /** @type {Icon | undefined} */ (undefined),

    /** Set to `true` to disable the primary button */
    primaryButtonDisabled = false,

    /**
     * Set to `true` to show a loading state on the primary button.
     * While loading, the button is non-interactive and submit is suppressed.
     * Same as `loadingStatus="active"`, except that the secondary buttons
     * stay enabled. `loadingStatus` wins when it is not `"inactive"`.
     */
    primaryButtonLoading = false,

    /**
     * Set the loading status of the footer.
     * Any status other than `"inactive"` shows `InlineLoading` with that
     * status in the primary button, disables the footer buttons, and
     * suppresses the primary action. `"finished"` calls `onloadingsuccess`
     * after the success delay.
     * @type {"inactive" | "active" | "finished" | "error"}
     */
    loadingStatus = "inactive",

    /**
     * Specify the description for the primary button loading state.
     * Passed to `InlineLoading` as `description`.
     */
    primaryButtonLoadingDescription = "Loading",

    /**
     * Specify the description for the primary button loading icon.
     * Passed to `InlineLoading` as `iconDescription`.
     * @type {string | undefined}
     */
    primaryButtonLoadingIconDescription = undefined,

    /** Specify the secondary button text */
    secondaryButtonText = "",

    /**
     * Set to `true` to show a loading state on the secondary button.
     * Only applies to the `secondaryButtonText` path (not `secondaryButtons`).
     * While loading, the button is non-interactive.
     */
    secondaryButtonLoading = false,

    /**
     * Specify the description for the secondary button loading state.
     * Passed to `InlineLoading` as `description`.
     */
    secondaryButtonLoadingDescription = "Loading",

    /**
     * One or two secondary buttons for the modal footer.
     * Supersedes `secondaryButtonText`. Each entry needs `text`; optional
     * `kind` (defaults to `"secondary"`), `disabled`, `loading`, and
     * `loadingDescription` (defaults to `"Loading"`) pass through to Button /
     * the loading state. With two entries plus a primary button, the footer
     * uses the three-button layout.
     * @type {ReadonlyArray<{ text: string; kind?: import("../Button/Button.svelte").ButtonProps["kind"]; disabled?: boolean; loading?: boolean; loadingDescription?: string }>}
     */
    secondaryButtons = [],

    /** Set to `true` to use the danger variant */
    danger = false,

    /**
     * Called when the user clicks a secondary button. For
     * `secondaryButtonText`, call `preventDefault()` to keep the modal
     * open; otherwise it closes. `secondaryButtons` never close it.
     * @type {((detail: import("../utils/cancelable.js").Cancelable<{ text: string }>) => void) | undefined}
     */
    onsecondaryaction = undefined,

    /**
     * Called when `loadingStatus` is `"finished"`, after the
     * `InlineLoading` success delay.
     * @type {(() => void) | undefined}
     */
    onloadingsuccess = undefined,

    /**
     * Content after the buttons.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();















  import { onMount } from "svelte";
  import Button from "../Button/Button.svelte";
  import InlineLoading from "../InlineLoading/InlineLoading.svelte";
  import { cancelable } from "../utils/cancelable.js";
  import { getComposedModal } from "./composed-modal-context.js";

  const modal = getComposedModal();
  // A footer makes the modal transactional, so an outside click keeps it
  // open by default. Register during init, as ModalHeader does.
  const unregisterFooter = modal.registerFooter();
  onMount(() => unregisterFooter);

  const footerBusy = $derived(
    Boolean(loadingStatus) && loadingStatus !== "inactive",
  );
  // `primaryButtonLoading` is the boolean form of "active"; a status
  // other than "inactive" takes precedence.
  const primaryStatus = $derived(
    footerBusy ? loadingStatus : primaryButtonLoading ? "active" : "inactive",
  );
  const primaryBusy = $derived(primaryStatus !== "inactive");

  function handlePrimaryClick() {
    if (primaryBusy) return;
    modal.primaryAction();
  }

  function handleSecondaryClick() {
    if (secondaryButtonLoading || footerBusy) return;
    const payload = cancelable({ text: secondaryButtonText });
    onsecondaryaction?.(payload);
    if (!payload.defaultPrevented) modal.closeModal();
  }
</script>

<div
  aria-busy={primaryStatus === "active" ? "true" : undefined}
  {...rest}
  class={[
    "bx--modal-footer",
    secondaryButtons.length === 2 && "bx--modal-footer--three-button",
    className,
  ]}
>
  {#if secondaryButtons.length > 0}
    {#each secondaryButtons as button (button.text)}
      <Button
        size="default"
        kind={button.kind ?? "secondary"}
        disabled={button.disabled || button.loading || footerBusy}
        onclick={() => {
          if (button.loading || footerBusy) return;
          onsecondaryaction?.(cancelable({ text: button.text }));
        }}
      >
        {#if button.loading}
          <InlineLoading
            class="bx--inline-loading--btn"
            status="active"
            description={button.loadingDescription ?? "Loading"}
          />
        {:else}
          {button.text}
        {/if}
      </Button>
    {/each}
  {:else if secondaryButtonText}
    <Button
      size="default"
      kind="secondary"
      disabled={secondaryButtonLoading || footerBusy}
      onclick={handleSecondaryClick}
    >
      {#if secondaryButtonLoading}
        <InlineLoading
          class="bx--inline-loading--btn"
          status="active"
          description={secondaryButtonLoadingDescription}
        />
      {:else}
        {secondaryButtonText}
      {/if}
    </Button>
  {/if}
  {#if primaryButtonText}
    <Button
      size="default"
      kind={danger ? "danger" : "primary"}
      disabled={primaryButtonDisabled || primaryBusy}
      icon={primaryBusy ? undefined : primaryButtonIcon}
      onclick={handlePrimaryClick}
    >
      {#if primaryBusy}
        <InlineLoading
          class="bx--inline-loading--btn"
          status={primaryStatus}
          description={primaryButtonLoadingDescription}
          iconDescription={primaryButtonLoadingIconDescription}
          on:success={() => onloadingsuccess?.()}
        />
      {:else}
        {primaryButtonText}
      {/if}
    </Button>
  {/if}
  {@render children?.()}
</div>
