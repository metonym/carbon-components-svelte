// @ts-check
import { createContext } from "svelte";

/**
 * What `InlineNotification`, `ToastNotification` and `Callout` give a
 * `NotificationActionButton` inside them. Fields are getters.
 * @typedef {object} NotificationActionContext
 * @property {string | undefined} describedBy The id of the title that describes the action.
 * @property {boolean} toast Whether the action sits in a toast.
 */

/** @type {[() => NotificationActionContext, (context: NotificationActionContext) => NotificationActionContext, () => boolean]} */
export const [
  getNotificationAction,
  setNotificationAction,
  hasNotificationAction,
] = createContext();

/**
 * What a `NotificationQueue` gives its toasts.
 * @typedef {object} NotificationQueueContext
 * @property {boolean} paused Whether the pointer or focus is in the queue, which holds every toast's timer.
 */

/** @type {[() => NotificationQueueContext, (context: NotificationQueueContext) => NotificationQueueContext, () => boolean]} */
export const [
  getNotificationQueue,
  setNotificationQueue,
  hasNotificationQueue,
] = createContext();
