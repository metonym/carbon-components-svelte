<script>
  /**
   * Internal: the page body rendered after the `<header>`. Not exported from
   * the package; only `PageHeader` ships. Re-provides the header's `Tabs`
   * context so `TabContent` placed in the body pairs with the header's tabs.
   */
  let {
    /**
     * Obtain a reference to the body element.
     * @type {null | HTMLDivElement}
     */
    ref = $bindable(null),

    /**
     * The page body.
     * @type {import("svelte").Snippet | undefined}
     */
    children = undefined,
  } = $props();

  import { setTabs } from "../Tabs/tabs-context.js";
  import { getPageHeader, setPageHeader } from "./page-header-context.js";

  const pageHeader = getPageHeader();

  /**
   * Stands in while the header has no `Tabs`: panels render unselected
   * and unpaired.
   * @type {import("../Tabs/tabs-context.js").TabsContext}
   */
  const noTabs = {
    selectedTabId: null,
    iconOnly: false,
    autoWidth: false,
    fullWidth: false,
    dismissible: false,
    container: false,
    navigation: false,
    secondaryLabelSupported: false,
    hasSecondaryLabel: false,
    dismissText: () => "",
    panelIdFor: () => undefined,
    tabIdFor: () => undefined,
    isPanelSelected: () => false,
    add: () => {},
    patch: () => {},
    remove: () => {},
    addPanel: (id, fallbackId) => id ?? fallbackId,
    renamePanel: () => {},
    removePanel: () => {},
    select: () => {},
    dismiss: () => {},
  };

  // The header's `Tabs` can mount after this body or be replaced, so resolve
  // them on each access instead of capturing them once.
  if (pageHeader) {
    setTabs(
      /** @type {import("../Tabs/tabs-context.js").TabsContext} */ (
        new Proxy(noTabs, {
          get: (target, key) => {
            const name = /** @type {keyof typeof noTabs} */ (key);
            return (pageHeader.getTabs() ?? target)[name];
          },
        })
      ),
    );
  }

  // `Tabs` nested inside a panel belong to the body, not the header.
  setPageHeader(undefined);
</script>

<div bind:this={ref} class="bx--page-header__body">
  {@render children?.()}
</div>
