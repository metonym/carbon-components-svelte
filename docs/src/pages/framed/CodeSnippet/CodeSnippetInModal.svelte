<script>
  import { Button, CodeSnippet, Modal } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Open modal</Button>

<Modal
  bind:open
  modalHeading="Install instructions"
  primaryButtonText="Done"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (open = false)}
>
  <CodeSnippet code="npm i carbon-components-svelte" />
</Modal>
