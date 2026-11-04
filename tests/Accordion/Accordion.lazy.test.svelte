<script lang="ts">
  import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
  import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";

  export let lazy = true;
  export let open = false;
  export let onToggle: (open: boolean) => void = () => {};
  export let onContentMount: () => void = () => {};

  function trackMount(_node: HTMLElement) {
    onContentMount();
  }
</script>

<Accordion>
  <AccordionItem
    titleText="Natural Language Classifier"
    {lazy}
    {open}
    onopenchange={(e) => onToggle(e.open)}
  >
    <p use:trackMount>Lazy panel content</p>
  </AccordionItem>
</Accordion>
