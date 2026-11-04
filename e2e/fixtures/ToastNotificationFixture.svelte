<script>
  import { ToastNotification } from "carbon-components-svelte";

  let open = true;
</script>

<ToastNotification
  data-testid="toast-notification"
  kind="success"
  titleText="Toast title"
  subtitleText="Toast subtitle"
  bind:open
/>
