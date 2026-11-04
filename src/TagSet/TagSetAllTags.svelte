<script>
  /**
   * Internal: the "View all" modal of `TagSet`, listing every tag with a
   * search field. Not exported from the package.
   */
  let {
    /** Whether the modal is open. */
    open = $bindable(false),

    /** The search text. */
    query = $bindable(""),

    /**
     * Obtain a reference to the tag list.
     * @type {null | HTMLUListElement}
     */
    listRef = $bindable(null),

    /** @type {import("./tag-set-context.js").TagSetItem[]} */
    tags = [],

    /** Set to `true` to keep dismissible tags closable. */
    closable = false,

    /** @type {string} */
    title,

    /** @type {string} */
    searchLabel,

    /** @type {(count: number) => string} */
    resultsLabel,

    /** @type {"xs" | "sm" | "default" | "lg" | "md" | undefined} */
    size = undefined,

    /**
     * A dismissible tag in the list was closed.
     * @type {((tag: import("./tag-set-context.js").TagSetItem) => void) | undefined}
     */
    ontagdismiss = undefined,
  } = $props();

  import Modal from "../Modal/Modal.svelte";
  import Search from "../Search/Search.svelte";
  import Tag from "../Tag/Tag.svelte";
  import { setTagSet } from "./tag-set-context.js";

  // These tags list the set's tags; they must not register with it.
  setTagSet(undefined);
</script>

<Modal bind:open passiveModal size="sm" modalHeading={title}>
  <Search
    bind:value={query}
    labelText={searchLabel}
    placeholder={searchLabel}
    data-modal-primary-focus
  />
  <ul bind:this={listRef} class="bx--tag-set-modal__list" aria-label={title}>
    {#each tags as tag (tag.id)}
      <li>
        <Tag
          type={/** @type {any} */ (tag.type)}
          filter={closable && tag.filter}
          disabled={tag.disabled}
          value={tag.value}
          {size}
          ondismiss={() => ontagdismiss?.(tag)}
        >
          {tag.label}
        </Tag>
      </li>
    {/each}
  </ul>
  <p
    class={[
      "bx--tag-set-modal__results",
      tags.length > 0 && "bx--visually-hidden",
    ]}
    role="status"
  >
    {resultsLabel(tags.length)}
  </p>
</Modal>
