<script lang="ts">
  import { Tab, TabContent, Tabs } from "carbon-components-svelte";
  import type { InstallCmds } from "../quick-start-snippets";
  import {
    PACKAGE_MANAGERS,
    packageManagerIndex,
    packageManagerTabLabel,
  } from "../store";
  import CodeBlock from "./CodeBlock.svelte";
  import DocCodeBox from "./DocCodeBox.svelte";

  export let cmds: InstallCmds;
</script>

<Tabs
  autoWidth
  selectedIndex={$packageManagerIndex}
  onselectedchange={(e) => packageManagerIndex.set(e.index)}
>
  {#each PACKAGE_MANAGERS as pm (pm)}
    <Tab label={packageManagerTabLabel(pm)} />
  {/each}
  {#snippet content()}
    {#each PACKAGE_MANAGERS as pm (pm)}
      <TabContent flush>
        <DocCodeBox>
          <CodeBlock type="single" language="bash" code={cmds[pm]} />
        </DocCodeBox>
      </TabContent>
    {/each}
  {/snippet}
</Tabs>
