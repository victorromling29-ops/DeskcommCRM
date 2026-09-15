import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("os ativos de marca e da fachada", () => {
  it("entrega o logo como PNG com transparência dentro da imagem Docker", () => {
    const logo = readFileSync(resolve(process.cwd(), "public/allbusiness-logo.png"));
    const dockerignore = readFileSync(resolve(process.cwd(), ".dockerignore"), "utf8");

    expect(logo.subarray(1, 4).toString("ascii")).toBe("PNG");
    // No cabeçalho IHDR, o tipo 6 declara RGBA: a imagem tem canal alfa real.
    expect(logo[25]).toBe(6);
    expect(dockerignore).toContain("!public/allbusiness-logo.png");
  });

  it("mantém movimento opcional e respeita a preferência por animação reduzida", () => {
    const css = readFileSync(resolve(process.cwd(), "app/(public)/acesso.module.css"), "utf8");

    expect(css).toContain("@keyframes arrive");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/\.brand, \.story, \.card\s*\{\s*animation:\s*none;\s*\}/);
  });
});
