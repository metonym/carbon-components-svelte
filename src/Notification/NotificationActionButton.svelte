<script>
  /** @extendProps {"../Button/Button.svelte"} ButtonProps */

  let {
    /** @type {import("svelte").Snippet | undefined} */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    /** @type {string | undefined | null} */
    "aria-describedby": ariaDescribedBy = undefined,

    ...rest
  } = $props();

  import Button from "../Button/Button.svelte";
  import { joinDescribedBy } from "../utils/field-status.js";
  import {
    getNotificationAction,
    hasNotificationAction,
  } from "./notification-context.js";

  // The notification's title describes the action, so focusing it reads
  // "Retry, button, Upload failed". As in Carbon React, a toast's action is
  // a tertiary button, not a ghost.
  const ctx = hasNotificationAction() ? getNotificationAction() : undefined;
</script>

<Button
  kind={ctx?.toast ? "tertiary" : "ghost"}
  size="small"
  {...rest}
  class={[
    ctx?.toast
      ? "bx--toast-notification__action-button"
      : "bx--inline-notification__action-button",
    className,
  ]}
  aria-describedby={joinDescribedBy(ctx?.describedBy, ariaDescribedBy)}
>
  {@render children?.()}
</Button>
