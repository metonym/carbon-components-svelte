<script lang="ts">
  import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
  import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";
</script>

<Accordion disabled>
  <AccordionItem titleText="Natural Language Classifier">
    <p>
      Natural Language Classifier uses advanced natural language processing and
      machine learning techniques to create custom classification models. Users
      train their data and the service predicts the appropriate category for the
      inputted text.
    </p>
  </AccordionItem>
  <AccordionItem titleText="Natural Language Understanding">
    <p>
      Analyze text to extract meta-data from content such as concepts, entities,
      emotion, relations, sentiment and more.
    </p>
  </AccordionItem>
  <AccordionItem titleText="Language Translator">
    <p>
      Translate text, documents, and websites from one language to another.
      Create industry or region-specific translations via the service's
      customization capability.
    </p>
  </AccordionItem>
</Accordion>
