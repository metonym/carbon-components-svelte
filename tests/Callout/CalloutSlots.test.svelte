<script lang="ts">
  import Link from "carbon-components-svelte/Link/Link.svelte";
  import Callout from "carbon-components-svelte/Notification/Callout.svelte";
</script>

<Callout kind="warning" titleId="quota-title">
  {#snippet titleText()}Storage almost full{/snippet}
  {#snippet subtitleText()}
    <Link href="/settings/billing" aria-describedby="quota-title">
      Upgrade your plan
    </Link>
  {/snippet}
  <p data-testid="extra">Older builds are removed first.</p>
</Callout>
