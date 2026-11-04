<script>
  import { Button } from "carbon-components-svelte";

  let ref;
</script>

<Button bind:ref>Primary button</Button>
<Button
  kind="ghost"
  onclick={() => {
    ref?.focus();
  }}
>
  Click to focus the Primary button
</Button>
