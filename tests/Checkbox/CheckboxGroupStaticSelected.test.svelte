<script lang="ts">
  import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
  import CheckboxGroup from "carbon-components-svelte/Checkbox/CheckboxGroup.svelte";

  export let onChange: (
    selected: ReadonlyArray<string | number>,
  ) => void = () => {};
</script>

<CheckboxGroup
  legendText="Notification preferences"
  name="prefs"
  selected={["email"]}
  onselectedchange={(e) => onChange(e.selected)}
>
  <Checkbox value="email" labelText="Email" />
  <Checkbox value="sms" labelText="SMS" />
  <Checkbox value="push" labelText="Push notifications" />
</CheckboxGroup>
