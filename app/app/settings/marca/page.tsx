/**
 * Configurações → Marca. A tela onde o admin de UMA organização troca o nome e a
 * cor que a empresa dele mostra dentro do sistema.
 *
 * ── Por que aqui, e não em `/admin/marca` ────────────────────────────────────
 *
 * `/admin/marca` edita a marca da INSTALAÇÃO — a que pinta o login, a tela de
 * erro e o e-mail de recuperação, superfícies anteriores a qualquer organização.
 * Num revendedor que hospeda várias empresas, dar aquilo ao admin de um tenant
 * seria dar a um cliente o controle da fachada dos outros. Esta tela é a camada
 * de cima da mesma pilha: vale só dentro de `/app`, e só para esta organização.
 *
 * ── Por que o papel mínimo é `admin` ─────────────────────────────────────────
 *
 * Medido nos gates das telas vizinhas: identidade da empresa (`display_name`,
 * `legal_name`, CNPJ, DPO) é admin (`settings/tenant/page.tsx`); billing é admin;
 * API tokens é admin. O nome e a cor que o cliente final do revendedor vê SÃO
 * identidade da empresa — dá-los a `manager` os colocaria abaixo de billing e de
 * tokens na mesma prancheta.
 *
 * E o gate daqui protege a ROTA, não a coluna: quem defende o dado é
 * `fn_definir_marca_da_organizacao`, que re-resolve o papel no banco e levanta
 * 42501. Server Action não passa por `requireRole` — ver o cabeçalho de
 * `app/actions/settings/updateMarcaDaOrganizacao.ts`.
 *
 * `redirect("/403")` e não `notFound()`: dentro do tenant, a existência desta
 * tela não é segredo de ninguém — o `manager` sabe que a empresa tem marca, só
 * não é ele quem a troca. Mesma escolha de `settings/tenant/page.tsx`.
 */
import Link from "next/link";
import { redirect } from "next/navigation";

import { Buildings, ShieldCheck } from "@/lib/ui/icons";
import { requireAuth, resolveActiveOrg } from "@/lib/auth/server";
import { ROLE_RANK } from "@/lib/auth/types";
import { marcaDaInstalacao } from "@/lib/branding/instalacao";
import { marcaDaOrganizacaoDeSettings } from "@/lib/branding/organizacao";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { traduzir } from "@/lib/i18n/dicionario";

import { FormularioDaMarcaDaOrganizacao } from "./_form";

export const metadata = { title: "Marca" };
export const dynamic = "force-dynamic";

export default async function MarcaDaOrganizacaoPage() {
  const user = await requireAuth();
  const activeOrg = await resolveActiveOrg(user);
  if (!activeOrg) redirect("/app");
  if (!(user.is_platform_admin && !user.support) && ROLE_RANK[activeOrg.role] < ROLE_RANK.admin) {
    redirect("/403");
  }

  // Client de SESSÃO para LER, igual às telas irmãs: a leitura de `organizations`
  // é permitida a membro pela RLS, e usar o admin client aqui seria contornar a
  // política para buscar o que a política já entrega. Quem precisa de privilégio
  // é a ESCRITA — e ela mora na função SQL, não nesta tela.
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", activeOrg.orgId)
    .maybeSingle();

  const gravada = marcaDaOrganizacaoDeSettings(data?.settings ?? null);
  const linha = await marcaDaInstalacao();
  const idioma = user.idioma;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          {traduzir("Marca da organização", idioma)}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {traduzir(
            "Personalize a empresa selecionada sem alterar as demais organizações.",
            idioma,
          )}
        </p>
      </header>

      <section
        data-testid="escopo-da-marca"
        aria-labelledby="titulo-escopo-da-marca"
        className="max-w-3xl overflow-hidden rounded-sm border border-accent bg-accent-soft"
      >
        <div className="flex gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-foreground shadow-xs">
            <Buildings size={22} weight="duotone" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              {traduzir("Organização ativa", idioma)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 id="titulo-escopo-da-marca" className="text-lg font-semibold text-text">
                {activeOrg.name}
              </h2>
              <span className="rounded-full border border-accent/30 bg-surface px-2.5 py-0.5 text-xs font-medium text-accent">
                {traduzir("Somente esta organização", idioma)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              {traduzir(
                "O nome, as cores e o logo abaixo serão aplicados somente a esta organização. A tela de entrada e as outras empresas não mudam.",
                idioma,
              )}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {traduzir(
                "Para personalizar outra empresa, troque a organização no seletor do topo antes de editar.",
                idioma,
              )}
            </p>
          </div>
        </div>

        {user.is_platform_admin && !user.support ? (
          <div className="flex flex-col gap-3 border-t border-accent/20 bg-surface/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <ShieldCheck size={18} className="shrink-0 text-accent" aria-hidden />
              <span>
                {traduzir(
                  "Quer mudar o login e a marca padrão usada por todas as empresas?",
                  idioma,
                )}
              </span>
            </div>
            <Link
              href="/admin/marca"
              className="shrink-0 text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-hidden"
            >
              {traduzir("Editar marca da plataforma", idioma)}
            </Link>
          </div>
        ) : null}
      </section>

      <FormularioDaMarcaDaOrganizacao
        gravada={{
          app_name: gravada?.app_name ?? null,
          accent_hex: gravada?.accent_hex ?? null,
          // O CAMINHO no bucket, não a URL: quem converte é `logoDaCamada`, do
          // lado do navegador, com a base do Storage injetada em runtime. Mandar
          // a URL pronta do servidor faria a tela ter uma segunda regra de
          // montagem, e a que divergisse seria a que ninguém abre.
          logo_path: gravada?.logo_path ?? null,
        }}
        // As DUAS camadas de baixo descem para o formulário, e não uma resolução
        // já pronta: a prévia ao vivo remonta a pilha inteira a cada tecla, pelo
        // mesmo caminho do servidor. Sem elas, a tela não saberia responder "e se
        // eu apagar o nome, o que aparece?" — que é a pergunta que o placeholder
        // e o bloco de origens existem para responder.
        instalacao={{
          app_name: linha?.app_name ?? null,
          logo_url: linha?.logo_url ?? null,
          logo_path: linha?.logo_path ?? null,
          accent_hex: linha?.accent_hex ?? null,
        }}
        // Só os três campos de marca do ambiente, nunca o objeto `env` inteiro:
        // isto atravessa a fronteira para o navegador, e o que atravessa é o que
        // já está visível na interface de qualquer forma.
        ambiente={{
          APP_NAME: env.APP_NAME,
          APP_LOGO_URL: env.APP_LOGO_URL,
          APP_ACCENT_HEX: env.APP_ACCENT_HEX,
        }}
      />
    </div>
  );
}
