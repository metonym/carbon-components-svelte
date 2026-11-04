<script lang="ts">
  import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
  import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";
</script>

<Accordion>
  <AccordionItem titleText="Details" {...$$restProps}>Content</AccordionItem>
</Accordion>
