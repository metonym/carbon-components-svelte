<script>
  import { Accordion, AccordionItem } from "carbon-components-svelte";
</script>

<Accordion data-testid="accordion">
  <AccordionItem titleText="Section 1" data-testid="accordion-item-1">
    <p>Content for section 1</p>
  </AccordionItem>
  <AccordionItem titleText="Section 2" data-testid="accordion-item-2">
    <p>Content for section 2</p>
  </AccordionItem>
</Accordion>
