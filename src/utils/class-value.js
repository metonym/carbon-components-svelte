// @ts-check

/**
 * Flatten a Svelte `class` value (a string, an array, or an object of
 * class names to conditions, nested) into a class string, as the `class`
 * attribute does. For passing a runes `class` prop on to a legacy component
 * that joins class strings itself.
 * @param {import("svelte/elements").ClassValue | undefined | null} value
 * @returns {string}
 */
export function toClassName(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    let out = "";
    for (const item of value) {
      const name = toClassName(item);
      if (name) out = out ? `${out} ${name}` : name;
    }
    return out;
  }
  if (typeof value === "object") {
    let out = "";
    for (const [name, on] of Object.entries(value)) {
      if (on) out = out ? `${out} ${name}` : name;
    }
    return out;
  }
  return "";
}
