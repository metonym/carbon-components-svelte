<script>
  import { AILabel, Button, Modal } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Review forecast</Button>

<Modal
  bind:open
  modalHeading="Usage forecast"
  primaryButtonText="Apply budget"
  secondaryButtonText="Cancel"
  onsecondaryaction={() => (open = false)}
  onprimaryaction={() => (open = false)}
>
  {#snippet decorator()}<AILabel>
      <p>Generated from 90 days of billing data across your workspace.</p>
    </AILabel>{/snippet}
  <p>
    Spend is projected to grow 12% next month. Raise the monthly budget to
    $4,800 to avoid overage alerts.
  </p>
</Modal>
