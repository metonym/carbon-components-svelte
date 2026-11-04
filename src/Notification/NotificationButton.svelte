<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @restProps {button}
   */
  let {
    /**
     * Set the type of notification.
     * @type {"toast" | "inline"}
     */
    notificationType = "toast",

    /** Set to `true` to use the low contrast icon fill. */
    lowContrast = false,

    /**
     * Specify the icon to render. Defaults to a close icon.
     * @type {Icon | undefined}
     */
    icon = undefined,

    /**
     * Specify the title of the icon.
     * @type {string | undefined}
     */
    title = undefined,

    /** Specify the ARIA label for the icon */
    iconDescription = "Close icon",

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import Close from "../icons/Close.svelte";

  const ButtonIcon = $derived(icon ?? Close);
</script>

<button
  type="button"
  aria-label={iconDescription}
  title={iconDescription}
  {...rest}
  class={[
    notificationType === "toast" && "bx--toast-notification__close-button",
    notificationType === "inline" && "bx--inline-notification__close-button",
    className,
  ]}
>
  <ButtonIcon
    size={20}
    {title}
    class={[
      notificationType === "toast" && "bx--toast-notification__close-icon",
      notificationType === "toast" &&
        lowContrast &&
        "bx--toast-notification__close-icon--low-contrast",
      notificationType === "inline" && "bx--inline-notification__close-icon",
      notificationType === "inline" &&
        lowContrast &&
        "bx--inline-notification__close-icon--low-contrast",
    ]
      .filter(Boolean)
      .join(" ")}
  />
</button>
