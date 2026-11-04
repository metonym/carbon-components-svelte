import type { ClassValue } from "svelte/elements";

/**
 * Flatten a Svelte `class` value (a string, an array, or an object of
 * class names to conditions, nested) into a class string, as the `class`
 * attribute does.
 */
export function toClassName(value: ClassValue | undefined | null): string;
