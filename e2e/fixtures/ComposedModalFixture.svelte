<script>
  import {
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
  } from "carbon-components-svelte";

  // `?passive` leaves out the ModalFooter, so an outside click closes the
  // modal.
  const passive = new URLSearchParams(location.search).has("passive");

  let open = false;
  let closeEvents = [];
</script>

<button type="button" data-testid="open-modal" on:click={() => (open = true)}>
  Open modal
</button>

<p data-testid="close-events">{closeEvents.join(",")}</p>

<ComposedModal
  bind:open
  onopenchange={(e) =>
    (closeEvents = [...closeEvents, e?.trigger ?? "null"])}
>
  <ModalHeader titleText="Modal title" />
  <ModalBody>
    <p data-testid="modal-body">Modal content</p>
    <input
      type="text"
      data-modal-primary-focus
      data-testid="modal-primary-focus"
      aria-label="Primary focus input"
    />
    <Select data-testid="modal-select" labelText="Contact method">
      <SelectItem value="slack" text="Slack" />
      <SelectItem value="email" text="Email" />
    </Select>
  </ModalBody>
  {#if !passive}
    <ModalFooter>
      <!-- The footer "Close" closes via app code (sets `open = false`), not a
           built-in close affordance — exercises the "programmatic" trigger. -->
      <Button data-testid="close-modal" onclick={() => (open = false)}>
        Close
      </Button>
    </ModalFooter>
  {/if}
</ComposedModal>
