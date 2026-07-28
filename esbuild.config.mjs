import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";
const banner = `/*
PyoInk — bundled by esbuild
Design: 00-사람/계획/2026-07-29-pyoink-detailed-design-exceptions.md
*/
`;

const context = await esbuild.context({
  banner: { js: banner },
  entryPoints: ["main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
  ],
  format: "cjs",
  target: "es2020",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
});

if (prod) {
  await context.rebuild();
  await context.dispose();
  process.exit(0);
} else {
  await context.watch();
}
