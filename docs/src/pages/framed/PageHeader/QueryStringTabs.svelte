<script>
  import {
    Column,
    PageHeader,
    queryParam,
    Row,
    Tab,
    TabContent,
    Tabs,
  } from "carbon-components-svelte";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "backups", label: "Backups" },
    { id: "settings", label: "Settings" },
  ];

  const selectedTab = queryParam("tab", {
    defaultValue: tabs[0].id,
    parse: (id) => (tabs.some((tab) => tab.id === id) ? id : undefined),
    // docs-only:start
    // Opt out of this docs site's router, which intercepts history calls.
    replace: (href) =>
      history.replaceState({ ...history.state, useRoutify: false }, "", href),
    // docs-only:end
  });
</script>

<PageHeader grid titleText="db-prod-01" subtitle="PostgreSQL 16 · us-south">
  {#snippet tabs()}
    <Tabs bind:selectedId={$selectedTab}>
      {#each tabs as tab (tab.id)}
        <Tab id={tab.id} label={tab.label} />
      {/each}
    </Tabs>
  {/snippet}
  {#each tabs as tab (tab.id)}
    <TabContent>
      <Row padding>
        <Column>{tab.label} content</Column>
      </Row>
    </TabContent>
  {/each}
</PageHeader>
