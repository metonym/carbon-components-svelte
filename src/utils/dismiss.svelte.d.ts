import type { Attachment } from "svelte/attachments";
import type { DismissParams } from "./dismiss-controller.js";

export type { DismissListener, DismissParams } from "./dismiss-controller.js";

/**
 * Attachment: `window` listeners while `enabled` is true. Pass a getter;
 * later values update the listeners in place. SSR-safe.
 */
export function dismiss(getOptions: () => DismissParams): Attachment;
