// @ts-check

/**
 * @typedef {"error" | "info" | "info-square" | "success" | "warning" | "warning-alt"} NotificationKind
 */

/**
 * Kind classes for each notification type, written out so every class name
 * appears in the source.
 * @type {Record<"inline" | "toast", Record<NotificationKind, [kind: string, lowContrastKind: string]>>}
 */
const KIND_CLASSES = {
  inline: {
    error: [
      "bx--inline-notification--error",
      "bx--inline-notification--low-contrast-error",
    ],
    info: [
      "bx--inline-notification--info",
      "bx--inline-notification--low-contrast-info",
    ],
    "info-square": [
      "bx--inline-notification--info-square",
      "bx--inline-notification--low-contrast-info-square",
    ],
    success: [
      "bx--inline-notification--success",
      "bx--inline-notification--low-contrast-success",
    ],
    warning: [
      "bx--inline-notification--warning",
      "bx--inline-notification--low-contrast-warning",
    ],
    "warning-alt": [
      "bx--inline-notification--warning-alt",
      "bx--inline-notification--low-contrast-warning-alt",
    ],
  },
  toast: {
    error: [
      "bx--toast-notification--error",
      "bx--toast-notification--low-contrast-error",
    ],
    info: [
      "bx--toast-notification--info",
      "bx--toast-notification--low-contrast-info",
    ],
    "info-square": [
      "bx--toast-notification--info-square",
      "bx--toast-notification--low-contrast-info-square",
    ],
    success: [
      "bx--toast-notification--success",
      "bx--toast-notification--low-contrast-success",
    ],
    warning: [
      "bx--toast-notification--warning",
      "bx--toast-notification--low-contrast-warning",
    ],
    "warning-alt": [
      "bx--toast-notification--warning-alt",
      "bx--toast-notification--low-contrast-warning-alt",
    ],
  },
};

/**
 * The classes for a notification's kind: the kind class, plus the
 * low-contrast kind class when `lowContrast` is set.
 * @param {"inline" | "toast"} type
 * @param {NotificationKind} kind
 * @param {boolean} lowContrast
 * @returns {string[]}
 */
export function kindClasses(type, kind, lowContrast) {
  const classes = KIND_CLASSES[type][kind];
  if (!classes) return [];
  return lowContrast ? [...classes] : [classes[0]];
}
