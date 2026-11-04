<script>
  /** @extendProps {"../Button/Button.svelte"} ButtonProps */

  import { getContext } from "svelte";
  import Button from "../Button/Button.svelte";
  import { joinDescribedBy } from "../utils/field-status.js";

  // The notification's title describes the action, so focusing it reads
  // "Retry, button, Upload failed". As in Carbon React, a toast's action is
  // a tertiary button, not a ghost.
  const { describedBy, toast } = getContext("carbon:NotificationAction") ?? {};

  import { createBubbler } from "svelte/legacy";

  // Re-dispatches a runes child's events to this component's `on:` listeners.
  const bubble = createBubbler();
</script>

<Button
  kind={toast ? "tertiary" : "ghost"}
  size="small"
  {...$$restProps}
  class={[
    toast
      ? "bx--toast-notification__action-button"
      : "bx--inline-notification__action-button",
    $$restProps.class,
  ]
    .filter(Boolean)
    .join(" ")}
  aria-describedby={joinDescribedBy(
    $describedBy,
    $$restProps["aria-describedby"],
  )}
  onclick={(e) => {
    $$restProps.onclick?.(e);
    bubble("click")(e);
  }}
  onmouseover={(e) => {
    $$restProps.onmouseover?.(e);
    bubble("mouseover")(e);
  }}
  onmouseenter={(e) => {
    $$restProps.onmouseenter?.(e);
    bubble("mouseenter")(e);
  }}
  onmouseleave={(e) => {
    $$restProps.onmouseleave?.(e);
    bubble("mouseleave")(e);
  }}
>
  <slot />
</Button>
