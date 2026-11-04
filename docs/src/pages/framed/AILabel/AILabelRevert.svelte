<script>
  import { AILabel, TextInput } from "carbon-components-svelte";

  const suggestion = "Database failover in us-east-1";

  let value = suggestion;
  let revertActive = false;
</script>

<TextInput
  labelText="Incident title"
  bind:value
  onvaluechange={() => (revertActive = value !== suggestion)}
>
  {#snippet decorator()}<AILabel
      bind:revertActive
      on:revert={() => (value = suggestion)}
    >
      <p>Suggested from the alert that opened this incident.</p>
    </AILabel>{/snippet}
</TextInput>
