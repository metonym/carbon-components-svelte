<script>
  import { ExpandableTile } from "carbon-components-svelte";
</script>

<ExpandableTile data-testid="expandable-tile">
  {#snippet above()}<span data-testid="above-fold">Above the fold</span
    >{/snippet}
  {#snippet below()}<span data-testid="below-fold">Below the fold</span
    >{/snippet}
</ExpandableTile>

<ExpandableTile
  data-testid="interactive-tile"
  hasInteractiveContent
  tileCollapsedLabel="View more"
  tileExpandedLabel="View less"
>
  {#snippet above()}<a href="#details">View details</a>{/snippet}
  {#snippet below()}<span>Below the fold</span>{/snippet}
</ExpandableTile>

<!-- No `hasInteractiveContent`: the tile finds the link itself. -->
<ExpandableTile
  data-testid="detected-tile"
  tileCollapsedLabel="Show billing"
  tileExpandedLabel="Hide billing"
>
  {#snippet above()}<span>Team plan</span>{/snippet}
  {#snippet below()}<a href="#billing">Billing history</a>{/snippet}
</ExpandableTile>
