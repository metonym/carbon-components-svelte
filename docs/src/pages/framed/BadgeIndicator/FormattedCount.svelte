<script>
  import { BadgeIndicator, Button, Stack } from "carbon-components-svelte";
  import Email from "carbon-icons-svelte/lib/Email.svelte";
  import Notification from "carbon-icons-svelte/lib/Notification.svelte";

  const notifications = 1200;
  const messages = 2_500_000;

  function formatCount(value) {
    return value.toLocaleString(undefined, {
      notation: "compact",
      maximumFractionDigits: 1,
    });
  }
</script>

<Stack orientation="horizontal" gap={7}>
  <Button
    kind="ghost"
    icon={Notification}
    iconDescription="Notifications"
    tooltipAlignment="start"
  >
    {#snippet badge()}<BadgeIndicator count={formatCount(notifications)} />{/snippet}
  </Button>
  <Button kind="ghost" icon={Email} iconDescription="Messages">
    {#snippet badge()}<BadgeIndicator count={formatCount(messages)} />{/snippet}
  </Button>
  <Button kind="ghost" icon={Notification} iconDescription="Notifications">
    {#snippet badge()}<BadgeIndicator count="99+" />{/snippet}
  </Button>
</Stack>
