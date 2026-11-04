<script>
  /**
   * @restProps {div}
   */

  let {
    /** Set to `true` to render a breadcrumb placeholder above the title. */
    breadcrumb = false,

    /** Set to `false` to omit the subtitle placeholder. */
    subtitle = true,

    /** Set to `true` to render an action button placeholder. */
    actions = false,

    /** Specify the number of tab placeholders. `0` renders no tabs row. */
    tabs = 0,

    /**
     * Match the `PageHeader`'s `grid` so the placeholder lines up the same way.
     * @type {boolean | "full-width"}
     */
    grid = /** @type {boolean | "full-width"} */ (false),

    /**
     * Match the `PageHeader`'s `fill`.
     * @type {"background" | "layer-01" | "layer-02"}
     */
    fill = /** @type {"background" | "layer-01" | "layer-02"} */ ("background"),

    /**
     * Match the `PageHeader`'s `size`.
     * @type {"default" | "sm"}
     */
    size = "default",

    /** Match the `PageHeader`'s `hideDivider`. */
    hideDivider = false,

    /** @type {import("svelte/elements").ClassValue | undefined} */
    class: className = undefined,

    ...rest
  } = $props();

  import Box from "../Box/Box.svelte";
  import BreadcrumbSkeleton from "../Breadcrumb/BreadcrumbSkeleton.svelte";
  import ButtonSkeleton from "../Button/ButtonSkeleton.svelte";
  import TabsSkeleton from "../Tabs/TabsSkeleton.svelte";
  import { toClassName } from "../utils/class-value.js";

  const skeletonClass = $derived(
    toClassName([
      "bx--page-header",
      "bx--page-header-skeleton",
      !hideDivider && "bx--page-header--divider",
      size === "sm" && "bx--page-header--sm",
      grid && "bx--page-header--grid",
      grid === "full-width" && "bx--page-header--grid-full-width",
      className,
    ]),
  );
</script>

<Box {...rest} {fill} class={skeletonClass}>
  <div class="bx--page-header__content">
    {#if breadcrumb}
      <div class="bx--page-header__breadcrumb-row">
        <BreadcrumbSkeleton noTrailingSlash />
      </div>
    {/if}

    <div class="bx--page-header__title-row">
      <div class="bx--page-header__title-group">
        <!-- Lines of the header's own type (a non-breaking space each), so
             the skeleton is the header's height at either size; a bar sits
             in each line. -->
        <div
          class={[
            "bx--page-header__skeleton-line",
            size === "sm" ? "bx--type-heading-03" : "bx--type-heading-04",
          ]}
        >
          <span class="bx--page-header__skeleton-bar"></span>&nbsp;
        </div>
        {#if subtitle}
          <p class="bx--page-header__skeleton-line bx--type-body-compact-01">
            <span
              class="bx--page-header__skeleton-bar bx--page-header__skeleton-bar--subtitle"
            ></span>&nbsp;
          </p>
        {/if}
      </div>
      {#if actions}
        <div class="bx--page-header__actions">
          <ButtonSkeleton />
        </div>
      {/if}
    </div>

    {#if tabs > 0}
      <div class="bx--page-header__tabs-row">
        <TabsSkeleton count={tabs} />
      </div>
    {/if}
  </div>
</Box>
