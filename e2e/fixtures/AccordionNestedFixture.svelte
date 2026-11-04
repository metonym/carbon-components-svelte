<script>
  import { Accordion, AccordionItem } from "carbon-components-svelte";
</script>

<Accordion data-testid="accordion-outer">
  <AccordionItem titleText="Outer" data-testid="accordion-item-outer">
    <Accordion data-testid="accordion-inner">
      <AccordionItem titleText="Inner" data-testid="accordion-item-inner">
        <p>Nested content</p>
      </AccordionItem>
    </Accordion>
  </AccordionItem>
</Accordion>
