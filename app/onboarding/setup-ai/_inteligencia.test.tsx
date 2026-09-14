import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";

vi.mock("@/hooks/i18n/useT", () => ({ useT: () => (text: string) => text }));
vi.mock("@/app/actions/onboarding/chaveDaIa", () => ({ salvarChaveDaIa: vi.fn() }));

import { InteligenciaDele } from "./_inteligencia";

describe("estado inicial da prova de crédito", () => {
  it("não promete sucesso no HTML antes da prova executar no cliente", () => {
    const html = renderToString(<InteligenciaDele inicial={{
      origem: "instalacao", provedor: "openai", rotulo: "OpenAI (GPT)", final: null,
    }} />);
    expect(html).toContain("Conferindo se a chave tem crédito");
    expect(html).not.toContain("Pronta para uso");
    expect(html).not.toContain("a chave respondeu e tem crédito");
  });

  it("continua pedindo chave quando não existe credencial", () => {
    const html = renderToString(<InteligenciaDele inicial={{
      origem: "nenhuma", provedor: "openai", rotulo: "OpenAI (GPT)", final: null,
    }} />);
    expect(html).toContain("Ele ainda não tem cérebro");
    expect(html).not.toContain("Pronta para uso");
  });
});
