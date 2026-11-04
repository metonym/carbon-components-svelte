<script>
  import { Tab, TabContent, Tabs } from "carbon-components-svelte";

  let selectedId = "dashboard";
  let tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "monitoring", label: "Monitoring" },
    { id: "activity", label: "Activity" },
    { id: "settings", label: "Settings", disabled: true },
  ];

  function handleDismiss({ id }) {
    tabs = tabs.filter((tab) => tab.id !== id);
  }
</script>

<Tabs type="container" bind:selectedId dismissible ondismiss={handleDismiss}>
  {#each tabs as tab (tab.id)}
    <Tab id={tab.id} label={tab.label} disabled={tab.disabled} />
  {/each}
  {#snippet content()}
    {#each tabs as tab (tab.id)}
      <TabContent>{tab.label} content</TabContent>
    {/each}
  {/snippet}
</Tabs>
