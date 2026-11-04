<script lang="ts">
  import Tag from "carbon-components-svelte/Tag/Tag.svelte";
  import Add from "carbon-icons-svelte/lib/Add.svelte";

  export let onFilterClick: () => void = () => {};
  export let onFilterClose: () => void = () => {};
  export let onInteractiveClick: () => void = () => {};
  export let onBodyClick: () => void = () => {};
  export let onBodyClose: () => void = () => {};
  export let onMouseover: () => void = () => {};
  export let onMouseenter: () => void = () => {};
  export let onMouseleave: () => void = () => {};
</script>

<Tag class="my-class" style="margin: 1rem;">IBM Cloud</Tag>

<Tag type="red">red</Tag>

<Tag type="magenta">magenta</Tag>

<Tag type="purple">purple</Tag>

<Tag type="blue">blue</Tag>

<Tag type="cyan">cyan</Tag>

<Tag type="teal">teal</Tag>

<Tag type="green">green</Tag>

<Tag type="gray">gray</Tag>

<Tag type="cool-gray">cool-gray</Tag>

<Tag type="warm-gray">warm-gray</Tag>

<Tag type="high-contrast">high-contrast</Tag>

<Tag type="outline">outline</Tag>

<Tag filter onclick={() => onFilterClick()} ondismiss={() => onFilterClose()}>
  Filterable
</Tag>

<Tag icon={Add}>Custom icon</Tag>

<Tag interactive onclick={() => onInteractiveClick()}>Text</Tag>

<Tag skeleton />

<Tag size="sm">Small tag</Tag>

<Tag size="xs">Extra small tag</Tag>

<Tag size="lg">Large tag</Tag>

<Tag size="lg" filter>Large filterable</Tag>

<Tag size="lg" skeleton />

<Tag filter disabled title="Custom title">Disabled filterable</Tag>

<Tag interactive disabled>Disabled interactive</Tag>

<Tag
  onmouseover={() => onMouseover()}
  onmouseenter={() => onMouseenter()}
  onmouseleave={() => onMouseleave()}
>
  Mouse events
</Tag>

<Tag interactive icon={Add}>Icon slot</Tag>

<Tag filter onclick={() => onBodyClick()} ondismiss={() => onBodyClose()}>
  Filter click and close
</Tag>

<Tag href="/filtered?tag=ml" type="blue">Linked tag</Tag>

<Tag href="/filtered?tag=ml" target="_blank">External linked tag</Tag>

<Tag href="/filtered?tag=ml" disabled>Disabled linked tag</Tag>

<Tag filter href="/should-not-link">Filter wins over href</Tag>
