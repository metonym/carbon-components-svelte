<script lang="ts">
  import PasswordInput from "carbon-components-svelte/TextInput/PasswordInput.svelte";
  import type { ComponentProps } from "svelte";

  export let size: ComponentProps<PasswordInput>["size"] = undefined;
  export let value: ComponentProps<PasswordInput>["value"] = "";
  export let type: ComponentProps<PasswordInput>["type"] = "password";
  export let placeholder = "";
  export let hidePasswordLabel = "Hide password";
  export let showPasswordLabel = "Show password";
  export let tooltipAlignment: ComponentProps<PasswordInput>["tooltipAlignment"] =
    "center";
  export let tooltipPosition: ComponentProps<PasswordInput>["tooltipPosition"] =
    "bottom";
  export let disabled = false;
  export let helperText = "";
  export let labelText = "";
  export let hideLabel = false;
  export let invalid = false;
  export let invalidText = "";
  export let warn = false;
  export let warnText = "";
  export let inline = false;
  export let readonly = false;
  export let fluid = false;
  export let id = "test-password-input";
  export let name = "";
  export let ref: ComponentProps<PasswordInput>["ref"] = null;
  export let portalTooltip: ComponentProps<PasswordInput>["portalTooltip"] =
    undefined;
  export let onFocus: () => void = () => {};
  export let onBlur: () => void = () => {};
  export let onInput: (event: Event) => void = () => {};
  export let onChange: (event: Event) => void = () => {};
</script>

<PasswordInput
  {...$$restProps}
  bind:ref
  {size}
  bind:value
  bind:type
  {placeholder}
  hidePasswordText={hidePasswordLabel}
  showPasswordText={showPasswordLabel}
  {tooltipAlignment}
  {tooltipPosition}
  {disabled}
  {helperText}
  {labelText}
  {hideLabel}
  {invalid}
  {invalidText}
  {warn}
  {warnText}
  {inline}
  {readonly}
  {fluid}
  {id}
  {name}
  {portalTooltip}
  oninput={onInput}
  onchange={onChange}
  onfocus={onFocus}
  onblur={onBlur}
/>

<div data-testid="bound">{value}</div>
<div data-testid="bound-type">{type}</div>
