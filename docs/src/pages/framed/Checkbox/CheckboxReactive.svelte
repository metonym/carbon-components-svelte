<script>
  import { Button, Checkbox, Stack } from "carbon-components-svelte";

  let checked = false;
</script>

<Stack inline gap={4}>
  <Checkbox labelText="Enable maintenance mode" bind:checked />
  <Button onclick={() => (checked = !checked)}>Toggle</Button>
  <div>
    <strong>checked:</strong>
    {checked}
  </div>
</Stack>
