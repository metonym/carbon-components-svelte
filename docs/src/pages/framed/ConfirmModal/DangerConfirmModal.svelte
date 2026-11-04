<script>
  import { Button, ConfirmModal } from "carbon-components-svelte";

  let open = false;
</script>

<Button kind="danger" onclick={() => (open = true)}
  >Delete all instances</Button
>

<ConfirmModal
  bind:open
  kind="danger"
  titleText="Delete all instances"
  confirmText="Delete"
>
  <p>This is a permanent action and cannot be undone.</p>
</ConfirmModal>
