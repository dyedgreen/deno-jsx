declare global {
  namespace JSX {
    type Element = Node;
    interface IntrinsicElements {
      [elemName: string]: unknown;
    }
  }
}

type litaral = string | number;
type NodeSet = Node | litaral | null | (Node | litaral | null)[];

export interface Component<P = unknown> {
  (props: P): NodeSet | Promise<NodeSet>;
}

interface Children {
  children?: (Node | litaral | null)[];
}

// deno-lint-ignore no-explicit-any
export interface Node<P = any> {
  type: Component<P> | string;
  props: P & Children;
}

export function h(
  type: Component | string,
  props?: { [prop: string]: unknown },
  ...children: (Node | litaral | null)[]
): JSX.Element {
  return { type, props: { ...props, children } };
}

export function Fragment({ children }: Children) {
  return children;
}

function escapeHTML(text: string): string {
  const entities: { [char: string]: string } = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&#39;",
    '"': "&#34;",
  };
  return text.replaceAll(/[&<>"']/g, (char) => {
    return entities[char];
  });
}

async function renderNodeSetToString(nodes: NodeSet): Promise<string> {
  if (nodes == null) {
    return "";
  } else if (typeof nodes !== "object") {
    return escapeHTML(`${nodes}`);
  } else if (Array.isArray(nodes)) {
    return (await Promise.all(
      nodes.map((child: NodeSet): Promise<string> =>
        renderNodeSetToString(child)
      ),
    )).join("");
  } else {
    return await renderToString(nodes);
  }
}

/**
 * Renders a given JSX node to a string.
 */
export async function renderToString(jsx: Node): Promise<string> {
  if (typeof jsx.type === "function") {
    return await renderNodeSetToString(await jsx.type(jsx.props));
  } else {
    // render props
    const props = Object.entries(jsx.props).map((
      [prop, value]: [string, unknown],
    ): string => {
      switch (prop) {
        case "dangerouslySetInnerHTML":
        case "children":
          return "";
        default:
          return ` ${prop}="${
            "".concat(value as string).replace(/\"/g, '\\"')
          }"`;
      }
    }).join("");

    // render inner HTML
    const children = jsx.props?.children ?? [];
    let innerHTML = "";
    if (jsx.props.dangerouslySetInnerHTML != null) {
      innerHTML = jsx.props.dangerouslySetInnerHTML?.__html ?? "";
    } else {
      innerHTML = await renderNodeSetToString(children);
    }

    // render HTML tag
    switch (jsx.type) {
      case "area":
      case "base":
      case "basefont":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "img":
      case "input":
      case "keygen":
      case "link":
      case "meta":
      case "param":
      case "source":
      case "spacer":
      case "track":
      case "wbr":
        return `<${jsx.type}${props} />`;
      default:
        return `<${jsx.type}${props}>${innerHTML}</${jsx.type}>`;
    }
  }
}
