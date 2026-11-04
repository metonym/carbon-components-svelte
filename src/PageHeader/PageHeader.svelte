<script>
  /**
   * @template {import("../utils/icon-component.js").IconComponent} [Icon=any]
   * @restProps {header}
   */

  let {
    /**
     * Specify the page title, or a snippet for rich title content.
     * @type {string | import("svelte").Snippet | undefined}
     */
    titleText = undefined,

    /**
     * Specify short eyebrow text above the title, such as the parent section
     * or resource type.
     * @type {string | undefined}
     */
    eyebrow = undefined,

    /**
     * Specify an icon to render before the eyebrow text.
     * @type {Icon | undefined}
     */
    eyebrowIcon: EyebrowIcon = undefined,

    /**
     * Specify the page subtitle.
     * @type {string | undefined}
     */
    subtitle = undefined,

    /**
     * Set to `true` to stick the header to the top of its nearest scroll
     * container while the page scrolls, offset by `stickyOffset`. Reuses
     * `Box`'s own `position="sticky"` and `top` — see `Box.svelte`. There is
     * no collapse-on-scroll animation in this version.
     */
    sticky = false,

    /**
     * Set how far from the top of the scroll container a `sticky` header
     * sticks, such as `"3rem"` to clear a UI Shell `Header`. Numbers `0`–`13`
     * use the shared layout scale; strings accept any CSS length.
     * @type {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | string}
     */
    stickyOffset = /** @type {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | string} */ (
      0
    ),

    /**
     * Set the header background using a Carbon layer token. Use `"layer-01"`
     * to set the header apart from a `"background"` page body.
     * @type {"background" | "layer-01" | "layer-02"}
     */
    fill = /** @type {"background" | "layer-01" | "layer-02"} */ ("background"),

    /**
     * Set to `true` to align the header, and the page body in `children`,
     * with a `Grid`: the same max width, centering, and breakpoint padding
     * as a `Grid`'s container, so the title lines up with a `Column`'s
     * content. In this mode the body is the grid container, so place `Row`s
     * in it directly. Set to `"full-width"` to match a `Grid fullWidth`,
     * which drops the max width.
     * @type {boolean | "full-width"}
     */
    grid = /** @type {boolean | "full-width"} */ (false),

    /**
     * Specify the header size. `"sm"` uses a smaller title and tighter
     * vertical spacing, for nested or detail pages.
     * @type {"default" | "sm"}
     */
    size = "default",

    /** Set to `true` to hide the border below the header. */
    hideDivider = false,

    /**
     * Obtain a reference to the rendered `<header>` element.
     * @type {null | HTMLElement}
     */
    ref = $bindable(null),

    /**
     * A `Breadcrumb` with its `BreadcrumbItem`s.
     * @type {import("svelte").Snippet | undefined}
     */
    breadcrumb = undefined,

    /**
     * Small actions at the end of the breadcrumb row.
     * @type {import("svelte").Snippet | undefined}
     */
    breadcrumbEnd = undefined,

    /**
     * An icon or `UserAvatar` before the title.
     * @type {import("svelte").Snippet | undefined}
     */
    titleStart = undefined,

    /**
     * A status `Tag`, indicator, or small actions after the title.
     * @type {import("svelte").Snippet | undefined}
     */
    titleEnd = undefined,

    /**
     * Longer rich text below the subtitle.
     * @type {import("svelte").Snippet | undefined}
     */
    description = undefined,

    /**
     * Key facts between the title and the tabs, such as a `DescriptionList`,
     * `BigNumber`s, or a `TagSet`.
     * @type {import("svelte").Snippet | undefined}
     */
    meta = undefined,

    /**
     * A `Tabs` with its `Tab`s. `TabContent`s in `children` pair with them.
     * @type {import("svelte").Snippet | undefined}
     */
    tabs = undefined,

    /**
     * Controls at the end of the tabs row, such as a time range `Dropdown`.
     * @type {import("svelte").Snippet | undefined}
     */
    tabsEnd = undefined,

    /**
     * A `ButtonSet` or `ActionSet` with its `Button`s.
     * @type {import("svelte").Snippet | undefined}
     */
    actions = undefined,

    /**
     * Page content rendered after the header. `TabContent` placed here pairs
     * with the `Tabs` in `tabs`.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import Box from "../Box/Box.svelte";
  import Heading from "../Heading/Heading.svelte";
  import Text from "../Text/Text.svelte";
  import { toClassName } from "../utils/class-value.js";
  import PageHeaderBody from "./PageHeaderBody.svelte";
  import { setPageHeader } from "./page-header-context.js";

  /**
   * The first `Tabs` in the header, shared with the body.
   * @type {undefined | import("../Tabs/tabs-context.js").TabsContext}
   */
  let tabsContext = $state.raw(undefined);

  /** @type {null | HTMLDivElement} */
  let bodyRef = $state(null);

  /**
   * The registered `Tabs`' `type`, reported by `Tabs` itself.
   * @type {undefined | "default" | "container"}
   */
  let tabsType = $state(undefined);

  setPageHeader({
    registerTabs: (context) => {
      if (tabsContext) return undefined;
      tabsContext = context;
      return {
        getBody: () => bodyRef,
        setType: (type) => {
          tabsType = type;
        },
        unregister: () => {
          tabsContext = undefined;
          tabsType = undefined;
        },
      };
    },
    getTabs: () => tabsContext,
  });

  const containerTabs = $derived(tabsType === "container");
</script>

{#snippet text(/** @type {string | import("svelte").Snippet} */ source)}
  {#if typeof source === "function"}{@render source()}{:else}{source}{/if}
{/snippet}

<Box
  {...rest}
  bind:ref
  tag="header"
  {fill}
  position={sticky ? "sticky" : undefined}
  top={sticky ? stickyOffset : undefined}
  class={toClassName([
    "bx--page-header",
    // Container tabs connect the selected tab to the surface below; a
    // divider would cut between them.
    !hideDivider && !containerTabs && "bx--page-header--divider",
    containerTabs && "bx--page-header--container-tabs",
    size === "sm" && "bx--page-header--sm",
    grid && "bx--page-header--grid",
    grid === "full-width" && "bx--page-header--grid-full-width",
    className,
  ])}
>
  <div class="bx--page-header__content">
    {#if breadcrumb || breadcrumbEnd}
      <div class="bx--page-header__breadcrumb-row">
        {@render breadcrumb?.()}
        {#if breadcrumbEnd}
          <div class="bx--page-header__breadcrumb-end">
            {@render breadcrumbEnd()}
          </div>
        {/if}
      </div>
    {/if}

    <div class="bx--page-header__title-row">
      <div class="bx--page-header__title-group">
        {#if eyebrow}
          <Text
            tag="div"
            type="label-01"
            color="secondary"
            class="bx--page-header__eyebrow"
          >
            {#if EyebrowIcon}
              <EyebrowIcon />
            {/if}
            <span>{eyebrow}</span>
          </Text>
        {/if}
        {#if titleText || titleStart || titleEnd}
          <div class="bx--page-header__title-line">
            {#if titleStart}
              <div class="bx--page-header__title-start">
                {@render titleStart()}
              </div>
            {/if}
            {#if titleText}
              <Heading
                type={size === "sm" ? "heading-03" : "heading-04"}
                class="bx--page-header__title"
              >
                {@render text(titleText)}
              </Heading>
            {/if}
            {#if titleEnd}
              <div class="bx--page-header__title-end">
                {@render titleEnd()}
              </div>
            {/if}
          </div>
        {/if}
        {#if subtitle}
          <Text
            type="body-compact-01"
            color="secondary"
            class="bx--page-header__subtitle"
          >
            {subtitle}
          </Text>
        {/if}
        {#if description}
          <Text tag="div" type="body-01" class="bx--page-header__description">
            {@render description()}
          </Text>
        {/if}
      </div>
      {#if actions}
        <div class="bx--page-header__actions">
          {@render actions()}
        </div>
      {/if}
    </div>

    {#if meta}
      <div class="bx--page-header__meta">
        {@render meta()}
      </div>
    {/if}

    {#if tabs || tabsEnd}
      <div
        class={[
          "bx--page-header__tabs-row",
          tabsEnd && "bx--page-header__tabs-row--with-end",
        ]}
      >
        {@render tabs?.()}
        {#if tabsEnd}
          <div class="bx--page-header__tabs-end">
            {@render tabsEnd()}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</Box>

{#if children}
  <PageHeaderBody bind:ref={bodyRef}>
    {@render children()}
  </PageHeaderBody>
{/if}
