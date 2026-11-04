<script lang="ts">
  import ConfirmModal from "carbon-components-svelte/ConfirmModal/ConfirmModal.svelte";
  import type { ComponentProps } from "svelte";

  export let open = false;
  export let kind: ComponentProps<ConfirmModal>["kind"] = undefined;
  export let title = "Delete this item?";
  export let label: ComponentProps<ConfirmModal>["labelText"] = undefined;
  export let confirmText = "Confirm";
  export let cancelText = "Cancel";
  export let confirmationPhrase: ComponentProps<ConfirmModal>["confirmationPhrase"] =
    undefined;
  export let confirmationLabel: ComponentProps<ConfirmModal>["confirmationLabel"] =
    undefined;
  export let loading = false;
  export let loadingDescription: ComponentProps<ConfirmModal>["loadingDescription"] =
    undefined;
  export let confirm: ComponentProps<ConfirmModal>["confirm"] = undefined;
  export let size: ComponentProps<ConfirmModal>["size"] = undefined;
  export let preventCloseOnClickOutside: ComponentProps<ConfirmModal>["preventCloseOnClickOutside"] =
    undefined;
  export let onconfirm: (() => void) | undefined = undefined;
  export let onopenchange: ComponentProps<ConfirmModal>["onopenchange"] =
    undefined;
  export let onconfirmerror: ComponentProps<ConfirmModal>["onconfirmerror"] =
    undefined;
</script>

<ConfirmModal
  bind:open
  {kind}
  titleText={title}
  labelText={label}
  {confirmText}
  {cancelText}
  {confirmationPhrase}
  {confirmationLabel}
  {loading}
  {loadingDescription}
  {confirm}
  {size}
  {preventCloseOnClickOutside}
  onconfirm={() => onconfirm?.()}
  onopenchange={(e) => onopenchange?.(e)}
  onconfirmerror={(e) => onconfirmerror?.(e)}
>
  <slot />
</ConfirmModal>
