<script>
  import {
    Button,
    CodeSnippet,
    ComposedModal,
    ModalBody,
    ModalHeader,
    Stack,
  } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Create API key</Button>

<ComposedModal preventCloseOnClickOutside bind:open>
  <ModalHeader titleText="API key created" />
  <ModalBody>
    <Stack gap={5}>
      <p>
        Copy this key now. You can't view it again after you close this dialog.
      </p>
      <CodeSnippet code="cld_live_8f3a2c91e4b7d605" />
    </Stack>
  </ModalBody>
</ComposedModal>
