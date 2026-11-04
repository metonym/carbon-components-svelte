<script>
  import {
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Stack,
    TextInput,
  } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Create database</Button>

<ComposedModal
  bind:open
  selectorPrimaryFocus="#advanced-options"
  onprimaryaction={() => (open = false)}
>
  <ModalHeader titleText="Create database" />
  <ModalBody>
    <Stack gap={3}>
      <p>Create a new Cloudant database in the US South region.</p>
      <TextInput
        id="db-name"
        labelText="Database name"
        placeholder="Enter database name..."
      />
      <Button id="advanced-options" kind="ghost" size="small">
        Advanced options
      </Button>
    </Stack>
  </ModalBody>
  <ModalFooter
    primaryButtonText="Confirm"
    secondaryButtonText="Cancel"
    onsecondaryaction={() => (open = false)}
  />
</ComposedModal>
