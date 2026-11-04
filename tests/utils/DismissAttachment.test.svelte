<script lang="ts">
  import { dismiss } from "carbon-components-svelte/utils/dismiss.svelte.js";

  let {
    enabled = true,
    handler = () => {},
  }: { enabled?: boolean; handler?: (event: Event) => void } = $props();
</script>

<div
  data-testid="host"
  {@attach dismiss(() => ({ enabled, type: "click", handler }))}
></div>
