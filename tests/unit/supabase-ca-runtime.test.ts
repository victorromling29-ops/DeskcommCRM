import { X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * O CA acompanha o Compose, não o disco gravável do contêiner: recriar app ou
 * worker numa atualização não pode perder a confiança no banco. Este gate é
 * offline e não lê credenciais; a conexão real com verify-full é prova da VPS.
 */
const raiz = process.cwd();
const compose = readFileSync(path.join(raiz, "docker-compose.prod.yml"), "utf8");
const pem = readFileSync(path.join(raiz, "docker/certs/supabase-ca.crt"), "utf8");
const readme = readFileSync(path.join(raiz, "docker/certs/README.md"), "utf8");
const caminhoNoContainer = "/etc/deskcomm/certs/supabase-ca.crt";
const origemOficial =
  "https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt";

/** Âncora independente: renovar o CA exige revisar procedência e este pin. */
const fingerprintEsperado =
  "80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA";

/** Mesmo formato de serviços que o gate packaging-artefato-do-cliente lê. */
function blocoDoServico(nome: "app" | "worker"): string {
  const bloco = compose.match(
    new RegExp(`^  ${nome}:\\r?\\n([\\s\\S]*?)(?=^  [\\w-]+:|^\\S|$(?![\\s\\S]))`, "m"),
  )?.[1];
  if (!bloco) throw new Error(`serviço '${nome}' ausente do Compose de produção`);
  return bloco;
}

/** Não aceita mera menção em comentário nem configuração em outro serviço. */
function temCaSomenteLeitura(bloco: string): boolean {
  const ambiente = bloco.match(/^    environment:\r?\n((?:^ {6}.*\r?\n)*)/m)?.[1] ?? "";
  const volumes = bloco.match(/^    volumes:\r?\n((?:^ {6}.*\r?\n)*)/m)?.[1] ?? "";
  return (
    ambiente
      .split(/\r?\n/)
      .some((linha) => linha.trim() === `NODE_EXTRA_CA_CERTS: ${caminhoNoContainer}`) &&
    volumes
      .split(/\r?\n/)
      .some((linha) => linha.trim() === "- ./docker/certs:/etc/deskcomm/certs:ro")
  );
}

describe("CA do Supabase permanece confiável após recriar os runtimes", () => {
  it.each(["app", "worker"] as const)(
    "%s monta o diretório somente leitura e entrega o CA ao Node",
    (servico) => {
      expect(temCaSomenteLeitura(blocoDoServico(servico))).toBe(true);
    },
  );

  it("reprova montagem gravável, arquivo isolado ou variável ausente", () => {
    const original = blocoDoServico("app");
    expect(temCaSomenteLeitura(original.replace("certs:ro", "certs:rw"))).toBe(false);
    expect(
      temCaSomenteLeitura(original.replace("./docker/certs:", "./docker/certs/supabase-ca.crt:")),
    ).toBe(false);
    expect(
      temCaSomenteLeitura(original.replace("NODE_EXTRA_CA_CERTS:", "# NODE_EXTRA_CA_CERTS:")),
    ).toBe(false);
  });

  it("não troca confiança explícita por verificação TLS desligada no Compose", () => {
    const linhasAtivas = compose
      .split(/\r?\n/)
      .filter((linha) => !/^\s*#/.test(linha))
      .join("\n");
    expect(linhasAtivas).not.toMatch(/NODE_TLS_REJECT_UNAUTHORIZED\s*[:=]\s*["']?0/);
    expect(linhasAtivas).not.toMatch(/sslmode\s*=\s*(?:disable|no-verify)/);
    expect(linhasAtivas).not.toMatch(/rejectUnauthorized\s*:\s*false/);
  });

  it("leva somente um certificado público de CA, com assinatura e fingerprint conferidos", () => {
    expect(pem.match(/-----BEGIN CERTIFICATE-----/g)).toHaveLength(1);
    expect(pem).not.toMatch(/PRIVATE KEY/);
    const certificado = new X509Certificate(pem);
    expect(certificado.ca).toBe(true);
    expect(certificado.subject).toContain("CN=Supabase Root 2021 CA");
    expect(certificado.issuer).toBe(certificado.subject);
    expect(certificado.verify(certificado.publicKey)).toBe(true);
    expect(certificado.fingerprint256).toBe(fingerprintEsperado);
  });

  it("confere as datas do certificado e avisa antes de distribuir um CA expirado", () => {
    const certificado = new X509Certificate(pem);
    const inicio = new Date(certificado.validFrom);
    const fim = new Date(certificado.validTo);
    expect(inicio.toISOString()).toBe("2021-04-28T10:56:53.000Z");
    expect(fim.toISOString()).toBe("2031-04-26T10:56:53.000Z");
    expect(inicio.getTime()).toBeLessThanOrEqual(Date.now());
    expect(fim.getTime()).toBeGreaterThan(Date.now());
  });

  it("documenta a origem oficial, a verificação completa e a renovação", () => {
    expect(readme).toContain(origemOficial);
    expect(readme).toContain("supabase/supabase");
    expect(readme).toContain("apps/studio/hooks/custom-content/custom-content.json");
    expect(readme).toContain("ssl:certificate_url");
    expect(readme).toContain("sslmode=verify-full");
    expect(readme).toMatch(/renovar[\s\S]*fingerprint[\s\S]*reiniciar app e worker/i);
  });
});
