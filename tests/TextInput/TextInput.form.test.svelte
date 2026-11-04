<script lang="ts">
  import TextInput from "carbon-components-svelte/TextInput/TextInput.svelte";
  import type { ComponentProps } from "svelte";

  export let value: ComponentProps<TextInput>["value"] = "";
  export let type: "text" | "number" = "text";
  export let onInput: (value: string | number | null) => void = () => {};
</script>

<form data-testid="form">
  <TextInput
    bind:value
    {type}
    name="user"
    labelText="User"
    onvaluechange={(e) => onInput(e.value)}
  />
</form>
<p data-testid="bound">{String(value)}</p>
