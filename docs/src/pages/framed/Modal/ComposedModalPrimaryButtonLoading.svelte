<script>
  import {
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "carbon-components-svelte";

  let open = false;
  let saving = false;

  function onSave() {
    saving = true;
    setTimeout(() => {
      saving = false;
      open = false;
    }, 2000);
  }
</script>

<Button onclick={() => (open = true)}>Save changes</Button>

<ComposedModal bind:open onprimaryaction={onSave}>
  <ModalHeader titleText="Save changes" />
  <ModalBody>
    <p>Save your changes to the Cloudant database configuration.</p>
  </ModalBody>
  <ModalFooter
    primaryButtonText="Save"
    secondaryButtonText="Cancel"
    primaryButtonLoading={saving}
    primaryButtonLoadingDescription="Saving..."
  />
</ComposedModal>
