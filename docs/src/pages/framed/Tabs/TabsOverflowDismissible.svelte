<script>
  import { Tab, TabContent, Tabs } from "carbon-components-svelte";

  const labels = [
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

  let selectedId = "tab-1";
  let tabs = labels.map((label, i) => ({ id: `tab-${i + 1}`, label }));

  function handleDismiss({ id }) {
    tabs = tabs.filter((tab) => tab.id !== id);
  }
</script>

<Tabs bind:selectedId dismissible ondismiss={handleDismiss}>
  {#each tabs as tab (tab.id)}
    <Tab id={tab.id} label={tab.label} />
  {/each}
  {#snippet content()}
    {#each tabs as tab (tab.id)}
      <TabContent>{tab.label} content</TabContent>
    {/each}
  {/snippet}
</Tabs>
