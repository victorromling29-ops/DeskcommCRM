import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("os ativos da marca AllBusiness", () => {
  it("entrega o logo como PNG com transparência dentro da imagem Docker", () => {
    const logo = readFileSync(resolve(process.cwd(), "public/allbusiness-logo.png"));
    const dockerignore = readFileSync(resolve(process.cwd(), ".dockerignore"), "utf8");

    expect(logo.subarray(1, 4).toString("ascii")).toBe("PNG");
    // No cabeçalho IHDR, o tipo 6 declara RGBA: a imagem tem canal alfa real.
    expect(logo[25]).toBe(6);
    expect(dockerignore).toContain("!public/allbusiness-logo.png");
  });

  it("mantém movimento opcional e respeita a preferência por animação reduzida", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

    expect(css).toContain("@keyframes allbusiness-auth-flow");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/\.allbusiness-auth-flow-pulse\s*\{\s*display:\s*none;\s*\}/);
  });
});
