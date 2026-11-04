// @ts-check
import { createContext } from "svelte";

/**
 * What a `TileGroup` gives its `RadioTile`s. Fields are getters over the
 * group's props.
 * @typedef {object} TileGroupContext
 * @property {any} selected The value of the checked tile, if any.
 * @property {string | undefined} name The group's `name`, which overrides each tile's.
 * @property {string} fallbackName The name tiles share when neither the group nor the tile has one.
 * @property {string | undefined} form
 * @property {boolean | undefined} required
 * @property {boolean} disabled
 * @property {"sm" | "md" | undefined} size
 * @property {(value: any, checked: boolean) => void} add Counts a mounted tile; a checked one selects its value.
 * @property {(value: any) => void} remove
 * @property {(value: any) => void} set Selects a value without calling `onselectedchange`, for a `checked` set from outside.
 * @property {(value: any) => void} select Selects a value as the user, calling `onselectedchange`.
 */

/** @type {[() => TileGroupContext, (context: TileGroupContext) => TileGroupContext, () => boolean]} */
export const [getTileGroup, setTileGroup, hasTileGroup] = createContext();

/**
 * What a `SelectableTileGroup` gives its `SelectableTile`s. Fields are
 * getters over the group's props.
 * @typedef {object} SelectableTileGroupContext
 * @property {ReadonlyArray<any>} selected The selected values.
 * @property {string | undefined} name
 * @property {string | undefined} form
 * @property {boolean} disabled
 * @property {"sm" | "md" | undefined} size
 * @property {(value: any) => () => void} register Counts a mounted tile's value, to warn about tiles that share one; returns its release.
 * @property {(value: any, selected: boolean) => void} set Adds or removes a value without calling `onselectedchange`: a tile's initial `selected`, a value change, or a form reset.
 * @property {(value: any, selected: boolean, shiftKey: boolean) => void} toggle Toggles a value as the user, or a range with Shift; calls `onselectedchange`.
 */

/** @type {[() => SelectableTileGroupContext, (context: SelectableTileGroupContext) => SelectableTileGroupContext, () => boolean]} */
export const [
  getSelectableTileGroup,
  setSelectableTileGroup,
  hasSelectableTileGroup,
] = createContext();
