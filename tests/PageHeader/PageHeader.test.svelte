<script lang="ts">
  import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";
  import BreadcrumbItem from "carbon-components-svelte/Breadcrumb/BreadcrumbItem.svelte";
  import Button from "carbon-components-svelte/Button/Button.svelte";
  import ButtonSet from "carbon-components-svelte/Button/ButtonSet.svelte";
  import PageHeader from "carbon-components-svelte/PageHeader/PageHeader.svelte";
  import Folder from "carbon-icons-svelte/lib/Folder.svelte";

  let ref: HTMLElement | null = null;
</script>

<PageHeader
  data-testid="basic"
  titleText="Databases"
  subtitle="Manage your database instances"
/>

<PageHeader data-testid="layer" titleText="Layer" fill="layer-01" hideDivider />

<PageHeader
  data-testid="sticky-offset"
  titleText="Sticky offset"
  sticky
  stickyOffset="3rem"
/>

<PageHeader
  data-testid="offset-not-sticky"
  titleText="Offset without sticky"
  stickyOffset="3rem"
/>

<PageHeader data-testid="small" size="sm" titleText="Small" />

<PageHeader data-testid="sticky" titleText="Sticky" sticky bind:ref />

<PageHeader data-testid="with-slots" titleText="With slots">
  {#snippet breadcrumb()}
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
    </Breadcrumb>
  {/snippet}
  {#snippet actions()}
    <ButtonSet>
      <Button>Create</Button>
    </ButtonSet>
  {/snippet}
</PageHeader>

<PageHeader data-testid="rich" titleText="Rich">
  {#snippet breadcrumbEnd()}
    <button type="button">Share</button>
  {/snippet}
  {#snippet titleStart()}
    <span>Icon</span>
  {/snippet}
  {#snippet titleEnd()}
    <span>Running</span>
  {/snippet}
  {#snippet description()}
    <p>Longer description</p>
  {/snippet}
  {#snippet meta()}
    <dl>
      <dt>Region</dt>
      <dd>us-south</dd>
    </dl>
  {/snippet}
</PageHeader>

<PageHeader
  data-testid="eyebrow"
  eyebrow="Resources"
  titleText="Eyebrow only"
/>

<PageHeader
  data-testid="eyebrow-icon"
  eyebrow="Resources"
  eyebrowIcon={Folder}
  titleText="Eyebrow with icon"
/>

<div data-testid="ref-tag">{ref?.tagName}</div>

<PageHeader data-testid="tabs-end-only" titleText="Tabs end only">
  {#snippet tabsEnd()}
    <span>Range</span>
  {/snippet}
</PageHeader>
