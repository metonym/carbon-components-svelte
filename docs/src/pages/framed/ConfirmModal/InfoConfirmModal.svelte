<script>
  import { Button, ConfirmModal } from "carbon-components-svelte";

  let open = false;
</script>

<Button onclick={() => (open = true)}>Sign out</Button>

<ConfirmModal
  bind:open
  kind="info"
  titleText="Sign out of your account?"
  confirmText="Sign out"
>
  <p>You can sign back in at any time.</p>
</ConfirmModal>
