<script>
  import {
    Box,
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Portal,
  } from "carbon-components-svelte";

  let open = false;
</script>

<Box
  display="flex"
  direction="column"
  gap={5}
  overflow="hidden"
  position="relative"
  height="200px"
  border="subtle"
  borderStyle="dashed"
  padding={5}
>
  <p>
    This container hides overflowing content. Without a portal, the modal would
    be clipped.
  </p>
  <div><Button onclick={() => (open = true)}>Open modal</Button></div>
  <Portal>
    <ComposedModal bind:open>
      <ModalHeader titleText="Composed Modal in Portal" />
      <ModalBody>
        <p>
          This composed modal is rendered in a portal, ensuring it appears above
          all z-index stacking contexts and parent overflow constraints.
        </p>
      </ModalBody>
      <ModalFooter
        primaryButtonText="Confirm"
        secondaryButtonText="Cancel"
        onsecondaryaction={() => (open = false)}
      />
    </ComposedModal>
  </Portal>
</Box>
