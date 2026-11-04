<script lang="ts">
  import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
  import CheckboxGroup from "carbon-components-svelte/Checkbox/CheckboxGroup.svelte";

  export let mode: "bind-group" | "checkbox-group" = "bind-group";
  export let group: string[] = [];
  export let required = false;
  export let onCheck: (checked: boolean) => void = () => {};
  export let onChange: (
    selected: ReadonlyArray<string | number>,
  ) => void = () => {};
</script>

<form data-testid="form">
  {#if mode === "bind-group"}
    <Checkbox
      bind:group
      name="channel"
      value="a"
      labelText="A"
      oncheckedchange={(e) => onCheck(e.checked)}
    />
    <Checkbox
      bind:group
      name="channel"
      value="b"
      labelText="B"
      oncheckedchange={(e) => onCheck(e.checked)}
    />
  {:else}
    <CheckboxGroup
      bind:selected={group}
      {required}
      name="channel"
      legendText="Channel"
      onselectedchange={(e) => onChange(e.selected)}
    >
      <Checkbox value="a" labelText="A" oncheckedchange={(e) => onCheck(e.checked)} />
      <Checkbox value="b" labelText="B" oncheckedchange={(e) => onCheck(e.checked)} />
    </CheckboxGroup>
  {/if}
</form>
<p data-testid="group">{group.join(",")}</p>
