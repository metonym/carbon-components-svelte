<script>
  import {
    Button,
    ComposedModal,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
    TextInput,
  } from "carbon-components-svelte";

  let open = false;
  let name = "Ada Lovelace";
  let draft = name;
  let showWarning = false;

  $: isDirty = draft !== name;
</script>

<Button
  onclick={() => {
    open = true;
    draft = name;
    showWarning = false;
  }}
>
  Edit name
</Button>

<ComposedModal
  bind:open
  onprimaryaction={() => {
    name = draft;
    open = false;
  }}
>
  <ModalHeader titleText="Edit name" />
  <ModalBody hasForm>
    {#if showWarning}
      <InlineNotification
        kind="warning"
        title="Unsaved changes"
        subtitle="Save your changes, or keep editing. Cancel stays open while the form is dirty."
        hideCloseButton
      />
    {/if}
    <TextInput labelText="Name" bind:value={draft} />
  </ModalBody>
  <ModalFooter
    primaryButtonText="Save"
    secondaryButtonText="Cancel"
    onsecondaryaction={(e) => {
      if (isDirty) {
        e.preventDefault();
        showWarning = true;
      }
    }}
  />
</ComposedModal>
