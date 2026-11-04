// @ts-check
import { createContext } from "svelte";

/**
 * What a `UserAvatarGroup` gives its `UserAvatar`s. Fields are getters over
 * the group's state.
 * @typedef {object} UserAvatarGroupContext
 * @property {"sm" | "md" | "lg" | "xl" | undefined} size The size avatars without their own take.
 * @property {(entry: { id: string; name: string | undefined }) => void} add Registers an avatar while it initializes.
 * @property {(id: string, name: string | undefined) => void} rename
 * @property {(id: string, node: HTMLElement) => void} setNode Records the avatar's element once it renders.
 * @property {(id: string) => void} remove
 * @property {(id: string) => boolean} isOverflow Whether the avatar is past the group's `max`.
 */

/** @type {[() => UserAvatarGroupContext, (context: UserAvatarGroupContext) => UserAvatarGroupContext, () => boolean]} */
export const [getUserAvatarGroup, setUserAvatarGroup, hasUserAvatarGroup] =
  createContext();
