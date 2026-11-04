<script lang="ts">
  import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
  import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
  import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";
  import type { ComponentProps } from "svelte";

  export let selected: ComponentProps<Tabs>["selectedIndex"] = 0;
</script>

<Tabs selectedIndex={selected}>
  <Tab label="Tab 1">
    {#snippet children({ selected })}<span
        data-testid="tab-0"
        data-selected={selected}>Tab 1</span
      >{/snippet}
  </Tab>
  <Tab label="Tab 2">
    {#snippet children({ selected })}<span
        data-testid="tab-1"
        data-selected={selected}>Tab 2</span
      >{/snippet}
  </Tab>
  <Tab label="Tab 3">
    {#snippet children({ selected })}<span
        data-testid="tab-2"
        data-selected={selected}>Tab 3</span
      >{/snippet}
  </Tab>
  {#snippet content()}
    <TabContent>Content 1</TabContent>
    <TabContent>Content 2</TabContent>
    <TabContent>Content 3</TabContent>
  {/snippet}
</Tabs>
