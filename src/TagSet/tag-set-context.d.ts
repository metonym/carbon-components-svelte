/** What a tag registers with its `TagSet`. */
export type TagSetItem = {
  id: string;
  node: HTMLElement | null | undefined;
  label: string;
  value?: string | number;
  type?: string;
  size: string;
  disabled: boolean;
  filter: boolean;
};

/**
 * What a `TagSet` gives its tags. Fields are getters over the set's state;
 * methods read it fresh, so a tag can ask while it registers.
 */
export type TagSetContext = {
  /** The size tags without their own take. */
  readonly size: "xs" | "sm" | "default" | "lg" | undefined;
  readonly navigation: "tab" | "roving";
  /** The tag that holds the roving tab stop; `null` until the set picks one. */
  readonly tabStopId: string | null;
  /** Registers a tag while it initializes. */
  register: (item: TagSetItem) => void;
  unregister: (id: string) => void;
  update: (id: string, patch: Partial<Omit<TagSetItem, "id">>) => void;
  /** Whether the tag is collapsed into "+N". */
  isOverflow: (id: string) => boolean;
  /** The tag's close button was clicked. */
  notifyClose: (id: string) => void;
};

export const getTagSet: () => TagSetContext | undefined;
export const setTagSet: (
  context: TagSetContext | undefined,
) => TagSetContext | undefined;
export const hasTagSet: () => boolean;
