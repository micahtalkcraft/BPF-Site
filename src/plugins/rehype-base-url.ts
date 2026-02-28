import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

/**
 * Rehype plugin that prepends the site's base URL to local asset paths
 * inside rendered markdown content.
 */
export function rehypeBaseUrl(options: { base: string }) {
  const base = options.base.replace(/\/$/, "");
  if (!base) return () => {}; // nothing to rewrite when base is "/"

  const attrRe = /(\s(?:src|href)=["'])\/(?!\/)/g;
  let callCount = 0;

  return (tree: Root) => {
    callCount++;
    if (callCount <= 3) {
      console.log(`[rehype-base-url] Processing tree #${callCount}, base="${base}"`);
      // Log first few children types
      const types = (tree.children || []).slice(0, 5).map((c: any) => c.type);
      console.log(`[rehype-base-url] First children types:`, types);
    }

    visit(tree, (node: any) => {
      // Handle parsed HAST elements
      if (node.type === "element") {
        const el = node as Element;
        if (typeof el.properties?.src === "string") {
          const src = el.properties.src;
          if (src.startsWith("/") && !src.startsWith(base)) {
            el.properties.src = `${base}${src}`;
          }
        }
        if (typeof el.properties?.href === "string") {
          const href = el.properties.href;
          if (href.startsWith("/") && !href.startsWith(base) && !href.startsWith("//")) {
            el.properties.href = `${base}${href}`;
          }
        }
      }

      // Handle raw/html nodes
      if (
        (node.type === "raw" || node.type === "html") &&
        typeof node.value === "string"
      ) {
        node.value = node.value.replace(attrRe, `$1${base}/`);
      }
    });
  };
}
