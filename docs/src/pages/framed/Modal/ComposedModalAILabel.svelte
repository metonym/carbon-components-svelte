<script>
  import {
    AILabel,
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
  } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Review forecast</Button>

<ComposedModal bind:open onprimaryaction={() => (open = false)}>
  <ModalHeader titleText="Usage forecast" />
  <ModalBody>
    Spend is projected to grow 12% next month. Raise the monthly budget to
    $4,800 to avoid overage alerts.
  </ModalBody>
  <ModalFooter primaryButtonText="Apply budget" />
  {#snippet decorator()}<AILabel>
      <p>Generated from 90 days of billing data across your workspace.</p>
    </AILabel>{/snippet}
</ComposedModal>
