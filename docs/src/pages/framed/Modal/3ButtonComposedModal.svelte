<script>
  import {
    Button,
    Checkbox,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "carbon-components-svelte";

  let open = true;
  let checked = false;
</script>

<Button onclick={() => (open = true)}>Review changes</Button>

<ComposedModal bind:open onprimaryaction={() => (open = false)}>
  <ModalHeader labelText="Changes" titleText="Confirm changes" />
  <ModalBody hasForm>
    <Checkbox labelText="I have reviewed the changes" bind:checked />
  </ModalBody>
  <ModalFooter
    primaryButtonText="Proceed"
    primaryButtonDisabled={!checked}
    secondaryButtons={[{ text: "Cancel" }, { text: "Review" }]}
    onsecondaryaction={({ text }) => {
      if (text === "Cancel") open = false;
      if (text === "Review") console.log("Review");
    }}
  />
</ComposedModal>
