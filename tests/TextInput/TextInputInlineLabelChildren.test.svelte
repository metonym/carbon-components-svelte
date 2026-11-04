<script lang="ts">
  import TextInput from "carbon-components-svelte/TextInput/TextInput.svelte";
</script>

<TextInput inline>
  {#snippet labelText()}<span>Inline Slot Label</span>{/snippet}
</TextInput>
