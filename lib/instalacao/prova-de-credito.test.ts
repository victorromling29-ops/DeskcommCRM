/**
 * A diferença entre "a chave existe" e "a chave funciona".
 *
 * O produto só sabia responder a primeira, e chamava isso de "Validada": o
 * validador bate no endpoint de LISTAGEM de modelos, que não consome crédito e
 * responde 200 com a conta zerada. Quem instalou, viu o selo verde e recebeu
 * erro na primeira conversa não tinha onde olhar.
 */
import { describe, expect, it, vi } from "vitest";

import {
  classificarResposta,
  montarRequisicaoDeProva,
  provarSaldo,
} from "@/lib/instalacao/prova-de-credito";
import { IDS_DE_PROVEDOR } from "@/lib/ai/pontos/provedores";

describe("montarRequisicaoDeProva", () => {
  it("sabe cobrar TODOS os provedores que a lista oferece", () => {
    // Se a lista ganhar um provedor e este módulo não souber testá-lo, o
    // diagnóstico ficaria mudo justamente para quem escolheu o mais novo.
    const semProva = IDS_DE_PROVEDOR.filter(
      (id) => montarRequisicaoDeProva(id, "k", "m") === null,
    );
    expect(semProva).toEqual([]);
  });

  it("é uma GERAÇÃO, não uma listagem — é o que o provedor cobra", () => {
    // O ponto do arquivo inteiro: listar modelos passa com saldo zero.
    for (const id of IDS_DE_PROVEDOR) {
      const req = montarRequisicaoDeProva(id, "k", "modelo-x");
      expect(req, id).not.toBeNull();
      expect(req!.url, `${id} está batendo num endpoint de catálogo`).not.toMatch(/\/models$/);
    }
  });

  it("pede o mínimo possível — o objetivo é atravessar a cobrança, não gerar texto", () => {
    const anthropic = montarRequisicaoDeProva("anthropic", "k", "m");
    expect(anthropic!.body).toMatchObject({ max_tokens: 1 });
  });

  it("provedor desconhecido não recebe 'ok' por omissão", () => {
    expect(montarRequisicaoDeProva("inventado", "k", "m")).toBeNull();
  });

  it.each(["gpt-5.6-terra", "gpt-4o"])(
    "OpenAI reserva orçamento curto para raciocínio sem substituir o modelo %s",
    (modelo) => {
      const req = montarRequisicaoDeProva("openai", "k", modelo)!;
      expect(req.url).toBe("https://api.openai.com/v1/chat/completions");
      expect(req.body).toEqual({
        model: modelo,
        max_completion_tokens: 256,
        messages: [{ role: "user", content: "Responda apenas OK." }],
      });
      expect(req.body).not.toHaveProperty("max_tokens");
    },
  );

  it("preserva os limites próprios de Anthropic, OpenRouter e Google", () => {
    for (const provider of ["anthropic", "openrouter"]) {
      const req = montarRequisicaoDeProva(provider, "k", "m")!;
      expect(req.body).toMatchObject({ max_tokens: 1 });
      expect(req.body).not.toHaveProperty("max_completion_tokens");
    }
    expect(montarRequisicaoDeProva("google", "k", "m")!.body).toMatchObject({
      generationConfig: { maxOutputTokens: 1 },
    });
  });
});

describe("classificarResposta", () => {
  it("200 é a única forma de passar", () => {
    expect(classificarResposta(200, "{}")).toEqual({ ok: true });
  });

  it("saldo/limite tem balde próprio — é o caso que o selo 'Validada' escondia", () => {
    const r = classificarResposta(429, '{"error":{"message":"insufficient_quota"}}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe("limite_ou_saldo");
  });

  it("chave recusada não se confunde com falta de saldo", () => {
    // São conselhos opostos: uma manda trocar a chave, a outra manda por
    // crédito na conta. Trocar os dois faz o operador mexer no que está certo.
    const r = classificarResposta(401, "invalid api key");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe("credencial_recusada");
  });

  it("provedor fora do ar não vira culpa da chave", () => {
    const r = classificarResposta(503, "service unavailable");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe("provedor_indisponivel");
  });

  it("modelo inexistente é diagnóstico próprio", () => {
    const r = classificarResposta(404, "model not found");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe("modelo_inexistente");
  });
});

describe("provarSaldo", () => {
  it("serializa o limite aceito pela OpenAI em uma única geração mínima", async () => {
    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      // Reproduz a rejeição mostrada no onboarding, sem chamar a API real.
      return new Response("{}", {
        status: "max_tokens" in body || body.max_completion_tokens < 256 ? 400 : 200,
      });
    });
    const r = await provarSaldo("openai", "chave-de-teste", "gpt-5.6-terra", {
      fetchImpl: fetchImpl as typeof fetch,
    });
    expect(r).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      model: "gpt-5.6-terra",
      max_completion_tokens: 256,
      messages: [{ role: "user", content: "Responda apenas OK." }],
    });
  });

  it("faz UMA chamada e devolve ok quando o provedor aceita", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const r = await provarSaldo("anthropic", "sk-x", "claude-sonnet-5", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("erro de rede não é chave ruim", async () => {
    // Dizer "credencial recusada" aqui mandaria o operador trocar uma chave
    // que está certa, enquanto o problema é o servidor não alcançar a internet.
    const fetchImpl = vi.fn(async () => {
      throw new Error("fetch failed");
    });
    const r = await provarSaldo("openai", "sk-x", "gpt-x", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe("provedor_indisponivel");
  });

  it("não engole o corpo do erro: a causa chega a quem vai consertar", async () => {
    const fetchImpl = vi.fn(
      async () => new Response('{"error":{"message":"insufficient_quota"}}', { status: 402 }),
    );
    const r = await provarSaldo("openrouter", "sk-or", "z-ai/glm-4.7", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.codigo).toBe("limite_ou_saldo");
      expect(r.httpStatus).toBe(402);
    }
  });
});
