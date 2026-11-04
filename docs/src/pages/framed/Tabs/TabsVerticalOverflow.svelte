<script>
  import { Tab, TabContent, TabsVertical } from "carbon-components-svelte";

  const items = [
    "Dashboard",
    "Monitoring",
    "Activity",
    "Settings",
    "Reports",
    "Billing",
    "Users",
    "Security",
    "Integrations",
    "Notifications",
    "Webhooks",
    "Audit logs",
  ];
</script>

<TabsVertical>
  {#each items as item}
    <Tab label={item} />
  {/each}
  {#snippet content()}
    {#each items as item}
      <TabContent>{item} content</TabContent>
    {/each}
  {/snippet}
</TabsVertical>
