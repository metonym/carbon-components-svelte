<script>
  import {
    Button,
    ComposedModal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ProgressIndicator,
    ProgressStep,
    Stack,
    TextInput,
  } from "carbon-components-svelte";
  import { tick } from "svelte";

  let open = false;
  let step = 0;
  let name = "";
  let region = "";

  async function goNext() {
    if (step < 2) {
      step++;
      await tick();
      const nextInput = document.querySelector(
        step === 1 ? "#region-input" : ".bx--modal-container .bx--btn--primary",
      );
      nextInput?.focus();
    } else {
      open = false;
    }
  }

  function handleSubmit() {
    goNext();
  }
</script>

<Button
  onclick={() => {
    open = true;
    step = 0;
    name = "";
    region = "";
  }}
>
  Create workspace
</Button>

<ComposedModal bind:open>
  <ModalHeader titleText="Create workspace" />
  <ModalBody hasForm>
    <form id="workspace-form" on:submit|preventDefault={handleSubmit}>
      <Stack gap={6}>
        <ProgressIndicator
          currentIndex={step}
          spaceEqually
          preventChangeOnClick
        >
          <ProgressStep complete={step > 0} label="General" />
          <ProgressStep complete={step > 1} label="Configure" />
          <ProgressStep label="Review" />
        </ProgressIndicator>
        {#if step === 0}
          <TextInput
            id="name-input"
            bind:value={name}
            labelText="Name"
            placeholder="e.g., My workspace"
          />
        {:else if step === 1}
          <TextInput
            id="region-input"
            bind:value={region}
            labelText="Region"
            placeholder="e.g., us-east-1"
          />
        {:else}
          <p>Review your workspace configuration before creating.</p>
          {#if name || region}
            <p>
              <strong>Name:</strong>
              {name || "(not set)"}
              · <strong>Region:</strong>
              {region || "(not set)"}
            </p>
          {/if}
        {/if}
      </Stack>
    </form>
  </ModalBody>
  <ModalFooter>
    <Button kind="ghost" onclick={() => (open = false)}>Cancel</Button>
    <Button kind="secondary" disabled={step === 0} onclick={() => step--}>
      Previous
    </Button>
    <Button type="submit" form="workspace-form">
      {step < 2 ? "Next" : "Create"}
    </Button>
  </ModalFooter>
</ComposedModal>
