<script>
  /**
   * Internal "+N" overflow avatar for `UserAvatarGroup`. Shadows the group
   * context so the inner `UserAvatar` does not register as a group item.
   */
  let {
    /** @type {string} */
    label,

    /** @type {string} */
    names = "",
  } = $props();

  import UserAvatar from "../UserAvatar/UserAvatar.svelte";
  import {
    getUserAvatarGroup,
    hasUserAvatarGroup,
    setUserAvatarGroup,
  } from "./user-avatar-group-context.js";

  const parent = hasUserAvatarGroup() ? getUserAvatarGroup() : undefined;

  // Opt out of registration and overflow, so the chip is never counted or
  // hidden, but keep sharing the parent's `size`. The chip's tooltip joins
  // the group's tooltip handoff through the `TooltipGroup` context, which
  // this does not shadow.
  setUserAvatarGroup({
    get size() {
      return parent?.size;
    },
    add() {},
    rename() {},
    setNode() {},
    remove() {},
    isOverflow: () => false,
  });
</script>

<UserAvatar
  class="bx--user-avatar-group__overflow"
  data-avatar-group-overflow="true"
  tooltipText={names}
>
  <!-- In RTL, bidi moves the sign to the far side of the count ("1+"). -->
  <span class="bx--user-avatar__text" dir="ltr">{label}</span>
</UserAvatar>
