<script>
  import { Search, SearchSkeleton } from 'carbon-components-svelte';

  let value = '';
  let skeleton = false;
</script>

<div
  on:click={() => {
    skeleton = !skeleton;
  }}>
  click
</div>

<div style="width: 400px">
  {#if skeleton}
    <SearchSkeleton small />
  {:else}
    <Search small bind:value />
  {/if}
  {value}
</div>
