# Super simple SSR for Deno using JSX

For when you quickly want to render some HTML on the server, but don't need to support any client
side interactivity.

Only functional components are supported. However, components may be asynchronous.

```tsx
/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, renderToString } from "https://deno.land/x/jsx/mod.ts";

// Only functional components are supported
function HelloWorld({ name }: {name: string}) {
  return <h1>Hello {name}!</h1>;
}

// However, the components may be asynchronous
async function File({ path }: { path: string }) {
  return <p>{await Deno.readTextFile(path)}</p>;
}

const html = await renderToString(
  <>
    <HelloWorld name="Deno" />
    <File path="README.txt" />
  </>
);
console.log(html);
```
