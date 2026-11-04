import { existsSync, rmSync } from "node:fs";
import { $ } from "bun";
import { sveld } from "sveld";

const SVELD_OPTIONS = {
  // Parse each `@example`'s markup, so a broken one fails static-checks
  // instead of reaching editor hovers and the API docs.
  checkExamples: "syntax" as const,
  glob: true,
  json: true,
  jsonOptions: {
    outFile: "docs/src/COMPONENT_API.json",
  },
  typesOptions: {
    outDir: "src",
  },
  diagnostics: {
    ignore: [
      // Each narrows the prop it inherits on purpose. ChatButton and its
      // skeleton take Carbon's ChatButton kinds and sizes, not Button's.
      {
        code: "sveld/extend-props-override",
        component: "./SkeletonIcon/SkeletonIcon.svelte",
        name: "size",
      },
      {
        code: "sveld/extend-props-override",
        component: "./UIShell/HeaderGlobalAction.svelte",
        name: "ref",
      },
      {
        code: "sveld/extend-props-override",
        component: "./Chat/ChatButton.svelte",
        name: "kind",
      },
      {
        code: "sveld/extend-props-override",
        component: "./Chat/ChatButton.svelte",
        name: "size",
      },
      {
        code: "sveld/extend-props-override",
        component: "./Chat/ChatButtonSkeleton.svelte",
        name: "size",
      },
      // Until ComboButton moves to runes, it forwards the runes Button's
      // DOM events to its own `on:` listeners through `createBubbler`,
      // which sveld can't trace to the documented events.
      {
        code: "sveld/event-no-source",
        component: "./ComboButton/ComboButton.svelte",
        name: "click",
      },
      {
        code: "sveld/event-no-source",
        component: "./ComboButton/ComboButton.svelte",
        name: "mousedown",
      },
      {
        code: "sveld/event-no-source",
        component: "./ComboButton/ComboButton.svelte",
        name: "focus",
      },
      {
        code: "sveld/event-no-source",
        component: "./ComboButton/ComboButton.svelte",
        name: "blur",
      },
      {
        code: "sveld/event-no-source",
        component: "./ComboButton/ComboButton.svelte",
        name: "mouseover",
      },
      {
        code: "sveld/event-no-source",
        component: "./ComboButton/ComboButton.svelte",
        name: "mouseenter",
      },
      {
        code: "sveld/event-no-source",
        component: "./ComboButton/ComboButton.svelte",
        name: "mouseleave",
      },
    ],
  },
};

console.time("[build-docs]");

// Delete only the types sveld generated: those beside a `.svelte` component.
// A runes module (`x.svelte.js`) keeps its hand-written `x.svelte.d.ts`.
await $`rm -f src/index.d.ts`;
for (const file of new Bun.Glob("src/**/*.svelte.d.ts").scanSync()) {
  if (existsSync(file.replace(/\.d\.ts$/, ""))) rmSync(file);
}
// `strict` fails the build on any sveld diagnostic, like a type that fell
// back to `any` or a JSDoc tag with nothing to attach to. CI's test jobs
// pass `--no-strict` because they only need the types; static-checks is the
// one job a diagnostic fails.
const strict = !process.argv.includes("--no-strict");
// In GitHub Actions, each diagnostic is also an annotation on its line in
// the PR diff.
const format = process.env.GITHUB_ACTIONS ? "github" : "text";
const { exitCode } = await sveld({ ...SVELD_OPTIONS, strict, format });

console.timeEnd("[build-docs]");
process.exitCode = exitCode;
