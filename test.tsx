/** @jsx h */
/** @jsxFrag Fragment */
import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";
import { Fragment, h, renderToString } from "./mod.ts";

function escape(text: string): string {
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

Deno.test("README example", async function () {
  function HelloWorld({ name }: { name: string }) {
    return <h1>Hello {name}!</h1>;
  }

  async function File({ path }: { path: string }) {
    return <p>{await Deno.readTextFile(path)}</p>;
  }

  const html = await renderToString(
    <>
      <HelloWorld name="Deno" />
      <File path="README.md" />
    </>,
  );
  assertEquals(
    html,
    `<h1>Hello Deno!</h1><p>${
      escape(await Deno.readTextFile("README.md"))
    }</p>`,
  );
});
