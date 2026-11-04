<script lang="ts">
  import Modal from "carbon-components-svelte/Modal/Modal.svelte";

  export let open = true;
  export let shouldSubmitOnEnter = true;
  export let primaryButtonDisabled = false;
  export let onsubmit: ((event: CustomEvent) => void) | undefined = undefined;
  export let onclickbuttonprimary: ((event: CustomEvent) => void) | undefined =
    undefined;
</script>

<Modal
  bind:open
  modalHeading="Enter Target Modal"
  primaryButtonText="Save"
  secondaryButtonText="Cancel"
  {shouldSubmitOnEnter}
  {primaryButtonDisabled}
  onprimaryaction={(e) => { ((e) => onsubmit?.(e))(e); ((e) => onclickbuttonprimary?.(e))(e); }}
>
  <textarea data-testid="modal-textarea"></textarea>
  <a href="#details" data-testid="modal-link">Learn more</a>
  <input data-testid="modal-input" />
  <select data-testid="modal-select">
    <option>One</option>
  </select>
  <div contenteditable="true" data-testid="modal-editable"></div>
</Modal>
