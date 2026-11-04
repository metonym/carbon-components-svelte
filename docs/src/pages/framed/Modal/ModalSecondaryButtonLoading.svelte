<script>
  import { Button, Modal } from "carbon-components-svelte";

  let open = false;
  let savingDraft = false;

  function onSaveDraft() {
    savingDraft = true;
    setTimeout(() => {
      savingDraft = false;
    }, 2000);
  }
</script>

<Button onclick={() => (open = true)}>Save changes</Button>

<Modal
  bind:open
  modalHeading="Save changes"
  primaryButtonText="Save"
  secondaryButtons={[
    {
      text: "Save as draft",
      kind: "secondary",
      loading: savingDraft,
      loadingDescription: "Saving...",
    },
  ]}
  onsecondaryaction={({ text }) => {
    if (text === "Save as draft") onSaveDraft();
  }}
  onprimaryaction={() => (open = false)}
>
  <p>Save your changes to the Cloudant database configuration.</p>
</Modal>
