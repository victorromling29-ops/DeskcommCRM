import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PALETTES } from "@/app/design/lib/tokens";

const CSS = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

describe("tema visual AllBusiness", () => {
  it("usa superfícies frias e o azul da marca como padrão", () => {
    expect(CSS).toContain("AllBusiness — Design System tokens (Steel Blue");
    expect(CSS).toContain("--color-bg: #f4f7fb;");
    expect(CSS).toContain("--color-surface-elevated: #eaf1f8;");
    expect(CSS).toContain("--color-accent-600: #076eae;");
    expect(CSS).toContain("--color-bg: #07111f;");
    expect(CSS).not.toContain("--color-bg: #faf9f6;");
    expect(CSS).not.toContain("--color-accent-600: #506d48;");
  });

  it("mantém a paleta da vitrine sincronizada com o produto", () => {
    expect(PALETTES.allbusiness).toMatchObject({
      id: "allbusiness",
      accent: { 600: "#076eae" },
      surfaces: {
        light: { bg: "#f4f7fb", surfaceElevated: "#eaf1f8" },
        dark: { bg: "#07111f", surfaceElevated: "#152438" },
      },
    });
  });
});
