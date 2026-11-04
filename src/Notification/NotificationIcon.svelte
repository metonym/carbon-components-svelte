<script>
  let {
    /**
     * Specify the kind of notification icon.
     * @type {"error" | "info" | "info-square" | "success" | "warning" | "warning-alt"}
     */
    kind = "error",

    /**
     * Set the type of notification.
     * @type {"toast" | "inline"}
     */
    notificationType = "toast",

    /** Set to `true` to use the low contrast icon fill. */
    lowContrast = false,

    /**
     * Specify a label for screen readers, such as "Warning". Leave it unset
     * to hide the icon from screen readers.
     * @type {string | undefined}
     */
    iconDescription = undefined,
  } = $props();

  import CheckmarkFilled from "../icons/CheckmarkFilled.svelte";
  import ErrorFilled from "../icons/ErrorFilled.svelte";
  import InformationFilled from "../icons/InformationFilled.svelte";
  import InformationSquareFilled from "../icons/InformationSquareFilled.svelte";
  import WarningAltFilled from "../icons/WarningAltFilled.svelte";
  import WarningFilled from "../icons/WarningFilled.svelte";

  const icons = {
    error: ErrorFilled,
    "info-square": InformationSquareFilled,
    info: InformationFilled,
    success: CheckmarkFilled,
    warning: WarningFilled,
    "warning-alt": WarningAltFilled,
  };

  const Icon = $derived(icons[/** @type {keyof typeof icons} */ (kind)]);
  const marker = $derived(`${lowContrast ? "low-contrast-" : ""}${kind}`);
  const iconClass = $derived(
    notificationType === "toast"
      ? `bx--toast-notification__icon bx--toast-notification__icon--${marker}`
      : notificationType === "inline"
        ? `bx--inline-notification__icon bx--inline-notification__icon--${marker}`
        : "",
  );
</script>

<Icon size={20} class={iconClass} title={iconDescription} />
