import { visit } from "unist-util-visit";

/**
 * Remark plugin that prepends the site's base URL to local asset paths
 * (src="/...", href="/...") inside raw HTML blocks in markdown content.
 * This ensures images and links work on GitHub Pages where base != "/".
 */
export function remarkBaseUrl(options: { base: string }) {
  const base = (options?.base ?? "").replace(/\/$/, "");
  if (!base) return () => {}; // nothing to rewrite when base is "/"

  const attrRe = /(\s(?:src|href)=["'])\/(?!\/)/g;

  return (tree: any) => {
    visit(tree, "html", (node: any) => {
      if (typeof node.value === "string") {
        node.value = node.value.replace(attrRe, `$1${base}/`);
      }
    });
  };
}
