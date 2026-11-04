<script lang="ts">
  import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
  import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";
  import Button from "carbon-components-svelte/Button/Button.svelte";

  export let open = false;
  export let disabled = false;
  export let accordionDisabled = false;
  export let onToggle: (open: boolean) => void = () => {};
</script>

<Button onclick={() => (disabled = !disabled)}>Toggle disabled</Button>

<Accordion disabled={accordionDisabled}>
  <AccordionItem
    titleText="Natural Language Classifier"
    {open}
    {disabled}
    onopenchange={(e) => onToggle(e.open)}
  >
    <p>Natural Language Classifier content</p>
  </AccordionItem>
</Accordion>
