<script>
  import {
    Button,
    ComposedModal,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "carbon-components-svelte";

  let open = false;
  let hasUnsavedChanges = true;
  let showWarning = false;
</script>

<Button
  onclick={() => {
    open = true;
    hasUnsavedChanges = true;
    showWarning = false;
  }}
>
  Open modal with unsaved changes
</Button>

<ComposedModal
  bind:open
  onopenchange={(e) => {
    console.log("Close triggered by:", e.trigger);
    if (hasUnsavedChanges) {
      e.preventDefault();
      showWarning = true;
    }
  }}
  onprimaryaction={() => {
    hasUnsavedChanges = false;
    open = false;
  }}
>
  <ModalHeader titleText="Edit profile" />
  <ModalBody>
    {#if showWarning}
      <InlineNotification
        kind="warning"
        titleText="Unsaved changes"
        subtitleText="Please save or discard your changes before closing."
        hideCloseButton
      />
    {/if}
    <p>You have unsaved changes. Click "Save" to apply them.</p>
  </ModalBody>
  <ModalFooter
    primaryButtonText="Save"
    secondaryButtonText="Discard changes"
    onsecondaryaction={() => {
      hasUnsavedChanges = false;
      showWarning = false;
      open = false;
    }}
  />
</ComposedModal>
