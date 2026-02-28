import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

/**
 * Rehype plugin that prepends the site's base URL to local asset paths
 * (src, href starting with /) inside rendered markdown content.
 * This ensures images and links work on GitHub Pages where base != "/".
 */
export function rehypeBaseUrl(options: { base: string }) {
  const base = options.base.replace(/\/$/, "");
  if (!base) return () => {}; // nothing to rewrite when base is "/"

  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      // Rewrite <img src="/...">
      if (node.tagName === "img" && typeof node.properties?.src === "string") {
        const src = node.properties.src;
        if (src.startsWith("/") && !src.startsWith(base)) {
          node.properties.src = `${base}${src}`;
        }
      }
      // Rewrite <a href="/..."> (local links in markdown)
      if (node.tagName === "a" && typeof node.properties?.href === "string") {
        const href = node.properties.href;
        if (href.startsWith("/") && !href.startsWith(base) && !href.startsWith("//")) {
          node.properties.href = `${base}${href}`;
        }
      }
      // Rewrite <source src="/..."> and <video src="/...">
      if (
        (node.tagName === "source" || node.tagName === "video") &&
        typeof node.properties?.src === "string"
      ) {
        const src = node.properties.src;
        if (src.startsWith("/") && !src.startsWith(base)) {
          node.properties.src = `${base}${src}`;
        }
      }
    });
  };
}
