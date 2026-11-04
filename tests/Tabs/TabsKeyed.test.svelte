<script lang="ts">
  import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
  import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
  import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";
  import TabsVertical from "carbon-components-svelte/Tabs/TabsVertical.svelte";

  export let items = ["a", "b", "c"];
  export let selected = 0;
  /** Renders `TabsVertical` instead of `Tabs`. */
  export let vertical = false;

  $: Component = (vertical ? TabsVertical : Tabs) as typeof Tabs;
</script>

<svelte:component this={Component} bind:selectedIndex={selected}>
  {#each items as item (item)}
    <Tab id={item} label={item.toUpperCase()} />
  {/each}
  {#snippet content()}
    {#each items as item (item)}
      <TabContent>{item}</TabContent>
    {/each}
  {/snippet}
</svelte:component>

<div data-testid="selected-index">{selected}</div>
