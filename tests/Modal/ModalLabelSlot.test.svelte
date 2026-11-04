<script lang="ts">
  import Modal from "carbon-components-svelte/Modal/Modal.svelte";
</script>

<Modal open passiveModal modalHeading="Create database">
  {#snippet modalLabel()}<span>New label</span>{/snippet}
  Content
</Modal>
