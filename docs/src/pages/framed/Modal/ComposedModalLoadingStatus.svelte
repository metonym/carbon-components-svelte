<script>
  import {
    Button,
    Checkbox,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "carbon-components-svelte";

  let open = false;
  let failSave = false;
  let loadingStatus = "inactive";

  $: loadingDescription =
    loadingStatus === "error"
      ? "Save failed"
      : loadingStatus === "finished"
        ? "Saved"
        : "Saving...";

  async function save() {
    loadingStatus = "active";
    // For demo purposes only: simulate a network request.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    loadingStatus = failSave ? "error" : "finished";
    if (failSave) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      loadingStatus = "inactive";
    }
  }
</script>

<Button onclick={() => (open = true)}>Save changes</Button>

<ComposedModal
  bind:open
  preventCloseOnClickOutside={loadingStatus !== "inactive"}
  onprimaryaction={save}
>
  <ModalHeader titleText="Save changes" />
  <ModalBody>
    <p>Save your changes to the Cloudant database configuration.</p>
    <Checkbox labelText="Simulate a failed save" bind:checked={failSave} />
  </ModalBody>
  <ModalFooter
    primaryButtonText="Save"
    secondaryButtonText="Cancel"
    {loadingStatus}
    primaryButtonLoadingDescription={loadingDescription}
    onloadingsuccess={() => {
      open = false;
      loadingStatus = "inactive";
    }}
  />
</ComposedModal>
