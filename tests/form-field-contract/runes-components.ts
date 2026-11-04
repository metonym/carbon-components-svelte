import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
import PasswordInput from "carbon-components-svelte/TextInput/PasswordInput.svelte";
import TextInput from "carbon-components-svelte/TextInput/TextInput.svelte";
import Toggle from "carbon-components-svelte/Toggle/Toggle.svelte";

/**
 * Field components that have moved to runes. They take the label as a
 * `labelText` snippet; the rest still take the `labelChildren` slot.
 * Delete this once every field has moved.
 */
export const RUNES_COMPONENTS = new Set<unknown>([
  Checkbox,
  PasswordInput,
  TextInput,
  Toggle,
]);
