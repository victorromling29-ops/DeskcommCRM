import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { PALETTES } from "@/app/design/lib/tokens";

const CSS = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

describe("tema visual padrão da plataforma", () => {
  it("usa superfícies claras, grafite e oliva como padrão", () => {
    expect(CSS).toContain("Design System tokens (Graphite");
    expect(CSS).toContain("--color-bg: #efefec;");
    expect(CSS).toContain("--color-surface-elevated: #e4e6e0;");
    expect(CSS).toContain("--color-accent-600: #53624a;");
    expect(CSS).toContain("--color-bg: #191c19;");
    expect(CSS).not.toContain("--color-bg: #faf9f6;");
    expect(CSS).not.toContain("--color-accent-600: #506d48;");
  });

  it("mantém a paleta da vitrine sincronizada com o produto", () => {
    expect(PALETTES.base).toMatchObject({
      id: "base",
      accent: { 600: "#53624a" },
      surfaces: {
        light: { bg: "#efefec", surfaceElevated: "#e4e6e0" },
        dark: { bg: "#191c19", surfaceElevated: "#2d322c" },
      },
    });
  });
});
