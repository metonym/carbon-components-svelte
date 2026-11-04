<script>
  import {
    AILabel,
    ComboBox,
    Dropdown,
    TextInput,
  } from "carbon-components-svelte";

  const items = [
    {
      id: "pager",
      text: "Legacy pager gateway for the platform on-call rotation",
    },
  ];
</script>

<div data-testid="dropdown">
  <Dropdown clearable labelText="Contact" selectedId="pager" {items}>
    {#snippet decorator()}<AILabel />{/snippet}
  </Dropdown>
</div>

<div data-testid="dropdown-invalid">
  <Dropdown
    clearable
    labelText="Contact"
    selectedId="pager"
    {items}
    invalid
    invalidText="This contact method is no longer supported"
  >
    {#snippet decorator()}<AILabel />{/snippet}
  </Dropdown>
</div>

<div data-testid="dropdown-warning">
  <Dropdown
    clearable
    labelText="Contact"
    selectedId="pager"
    {items}
    warn
    warnText="This contact method is deprecated"
  >
    {#snippet decorator()}<AILabel />{/snippet}
  </Dropdown>
</div>

<div data-testid="combobox-invalid">
  <ComboBox
    labelText="Contact"
    selectedId="pager"
    {items}
    invalid
    invalidText="This contact method is no longer supported"
  >
    {#snippet decorator()}<AILabel />{/snippet}
  </ComboBox>
</div>

<!-- The revert button is wider than the label it replaces. -->
<div data-testid="text-input">
  <TextInput labelText="Incident title" value="Database failover">
    {#snippet decorator()}<AILabel />{/snippet}
  </TextInput>
</div>

<div data-testid="text-input-revert">
  <TextInput labelText="Incident title" value="Database failover">
    {#snippet decorator()}<AILabel revertActive />{/snippet}
  </TextInput>
</div>
