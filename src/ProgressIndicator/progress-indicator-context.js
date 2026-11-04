// @ts-check
import { createContext } from "svelte";

/**
 * @typedef {object} StepEntry
 * @property {string} id
 * @property {boolean} complete
 * @property {boolean} disabled
 */

/**
 * What a `ProgressIndicator` gives its `ProgressStep`s. Fields are getters
 * over the indicator's state.
 * @typedef {object} ProgressIndicatorContext
 * @property {string | null} currentStepId The current step; `null` while it hasn't registered.
 * @property {boolean} preventChangeOnClick
 * @property {(status: "complete" | "invalid") => string} statusText
 * @property {(entry: StepEntry) => void} add
 * @property {(id: string, patch: Partial<Omit<StepEntry, "id">>) => void} patch
 * @property {(id: string) => void} remove
 * @property {(id: string) => void} change Makes a step current as the user; calls `oncurrentchange`.
 */

/** @type {[() => ProgressIndicatorContext, (context: ProgressIndicatorContext) => ProgressIndicatorContext, () => boolean]} */
export const [
  getProgressIndicator,
  setProgressIndicator,
  hasProgressIndicator,
] = createContext();
