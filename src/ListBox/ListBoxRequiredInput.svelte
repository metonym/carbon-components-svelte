<script>
  /**
   * Constraint-validation proxy for a list box whose value lives in hidden
   * inputs, which the browser never validates. A required text input that is
   * empty when nothing is selected, so a wrapping `<form>` blocks submit.
   * Kept out of the tab order and the accessibility tree. The browser's error
   * bubble is cancelled; on a submit attempt, the owner shows its invalid
   * state on `onrequiredinvalid` instead, and clears it on `onformreset`.
   * Calling `checkValidity()` from code shows nothing.
   */
  let {
    /** Set to `true` when the list box has a selection */
    hasValue = false,

    /** Set to `true` to bar the proxy from validation, as a disabled field is */
    disabled = false,

    /** Set to `true` to bar the proxy from validation, as a read-only field is */
    readonly = false,

    /**
     * The element focused when a submit attempt finds the field empty.
     * @type {null | HTMLElement}
     */
    focusTarget = null,

    /**
     * The `id` of a `<form>` to validate with when the list box is outside it.
     * @type {string | undefined}
     */
    form = undefined,

    /**
     * Called when a submit attempt finds the field empty.
     * @type {(() => void) | undefined}
     */
    onrequiredinvalid = undefined,

    /**
     * Called when the owning form resets.
     * @type {(() => void) | undefined}
     */
    onformreset = undefined,
  } = $props();

  import { formReset } from "../utils/form-reset.js";
  import { submitAttempts } from "../utils/submit-attempt.js";
  import { handleRequiredInvalid } from "./list-box-utils.js";
</script>

<input
  type="text"
  class="bx--visually-hidden"
  tabindex="-1"
  aria-hidden="true"
  autocomplete="off"
  required
  value={hasValue ? "selected" : ""}
  {disabled}
  {readonly}
  {form}
  use:formReset={() => onformreset?.()}
  use:submitAttempts
  oninvalid={(event) => {
    if (handleRequiredInvalid(event, { focusTarget, proxy: true })) {
      onrequiredinvalid?.();
    }
  }}
/>
