<script>
  import {
    ActionSet,
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "carbon-components-svelte";

  let open = true;
</script>

<Button onclick={() => (open = true)}>Continue setup</Button>

<ComposedModal bind:open>
  <ModalHeader title="Continue setup" />
  <ModalBody>
    <p>Review this step, go back, or continue to the next one.</p>
  </ModalBody>
  <ModalFooter>
    <ActionSet size="lg" disableStacking>
      <Button kind="ghost" onclick={() => (open = false)}>Cancel</Button>
      <Button kind="secondary">Previous</Button>
      <Button onclick={() => (open = false)}>Next</Button>
    </ActionSet>
  </ModalFooter>
</ComposedModal>
