<script lang="ts">
  import Modal from "carbon-components-svelte/Modal/Modal.svelte";

  export let open = false;
  export let onclose: ((detail: { trigger: string }) => void) | undefined =
    undefined;
</script>

{#if open}
  <Modal
    bind:open
    modalHeading="Unmount On Close"
    onopenchange={(e) => onclose?.(e)}
  />
{/if}
