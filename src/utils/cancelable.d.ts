/** A callback payload the callee can cancel, as with a DOM event. */
export type Cancelable<T extends object> = T & {
  /** Skip the action the callback announced. */
  preventDefault(): void;
  readonly defaultPrevented: boolean;
};

export function cancelable<T extends object>(detail: T): Cancelable<T>;
