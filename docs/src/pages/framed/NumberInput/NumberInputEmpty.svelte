<script>
  import {
    Button,
    ButtonSet,
    NumberInput,
    Stack,
  } from "carbon-components-svelte";

  let value = null;
</script>

<Stack gap={4}>
  <NumberInput
    labelText="Clusters"
    allowEmpty
    bind:value
    helperText="Value: {value}"
  />
  <ButtonSet>
    <Button kind="tertiary" size="small" onclick={() => (value = null)}>
      Set to null
    </Button>
    <Button kind="tertiary" size="small" onclick={() => (value = 0)}>
      Set to 0
    </Button>
  </ButtonSet>
</Stack>
