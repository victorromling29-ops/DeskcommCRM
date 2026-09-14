import { LogotipoDoProduto } from "@/components/branding/MarcaDoProduto";
import { marcaEhADoProduto } from "@/lib/branding";
import { marcaDaSaida } from "@/lib/branding/saida";
import { createClient } from "@/lib/supabase/server";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";

/**
 * A casca das telas de acesso — login, cadastro, recuperação, MFA.
 *
 * ── Por que o LOGO mora aqui, e não em `login/page.tsx` ───────────────────────
 *
 * São seis telas no grupo `(public)`, e todas são "antes de entrar": quem instala
 * o produto para clientes mostra a marca dele exatamente aí. Um `<img>` por
 * página seriam seis cópias que divergem na primeira vez que alguém mexer numa
 * só — e a que ficaria para trás é sempre a que ninguém abre (recuperação de
 * senha, cadastro de MFA), que é justamente onde o cliente do revendedor
 * aparece sozinho e sem contexto.
 *
 * ── Por que `marcaDaSaida(null)` ──────────────────────────────────────────────
 *
 * Aqui não existe organização resolvida: `null` é a declaração disso, e a pilha
 * resultante é a mesma do layout raiz (banco acima, `.env` embaixo). Montar a
 * pilha à mão nesta tela faria a fachada anunciar uma precedência que o resto do
 * produto não usa. E `marcaDaSaida` NUNCA lança (ver o cabeçalho dela): uma cor
 * ou um logo mal gravados não podem derrubar a única tela por onde se entra para
 * corrigi-los.
 *
 * Sem logo configurado E com o nome padrão, a fachada mostra o logotipo do
 * PRODUTO (`components/branding/MarcaDoProduto.tsx`) — inline, sem `<img>`,
 * para que `tests/e2e/marca-logo.spec.ts` continue medindo "a fachada está sem
 * `<img>`" como "sem logo do revendedor".
 *
 * O NOME continua saindo de `branding()` dentro de cada página — não é descuido,
 * está medido em `tests/e2e/icone-da-marca.spec.ts:64-77`: aquela spec cruza duas
 * resoluções independentes (o título da aba, que lê o banco, contra o texto sob
 * o "Entrar", que lê o `.env`). Trocar o texto para este mesmo resolvedor
 * deixaria a spec verde medindo nada.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const marca = await marcaDaSaida(null);
  // A maioria destas telas roda ANTES do login (não há usuário nenhum), mas
  // duas — `/login/mfa` e, em parte, `/login/recovery` — rodam com uma sessão
  // parcial já criada (primeiro fator verificado, segundo pendente). Onde há
  // sessão, o idioma salvo no perfil vale; sem ela, `IdiomaProvider` já cai no
  // padrão pt-BR sozinho (ver o cabeçalho do provider) — nunca lança.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const locale = (user?.user_metadata?.locale as string | undefined) ?? null;

  return (
    <IdiomaProvider locale={locale}>
      <div className="allbusiness-auth-shell relative min-h-screen overflow-hidden bg-[#040914] text-white">
        <div className="allbusiness-auth-grid" aria-hidden="true" />
        <div className="allbusiness-auth-orb allbusiness-auth-orb-one" aria-hidden="true" />
        <div className="allbusiness-auth-orb allbusiness-auth-orb-two" aria-hidden="true" />

        <main className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[1.12fr_0.88fr]">
          <section
            className="allbusiness-auth-intro hidden flex-col justify-between px-12 py-12 lg:flex xl:px-20 xl:py-16"
            aria-label={`Sobre ${marca.nome}`}
          >
            <div className="allbusiness-auth-enter allbusiness-auth-enter-one">
              {marca.logoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-testid="logo-da-fachada"
                    src={marca.logoUrl}
                    alt={marca.nome}
                    className="h-24 w-auto max-w-[18rem] object-contain object-left"
                  />
                </>
              ) : marcaEhADoProduto({ name: marca.nome, logoUrl: null }) ? (
                <LogotipoDoProduto nome={marca.nome} className="h-14 w-auto" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">{marca.nome}</p>
              )}
            </div>

            <div className="max-w-2xl pb-10">
              <p className="allbusiness-auth-kicker allbusiness-auth-enter allbusiness-auth-enter-two font-mono text-xs tracking-[0.24em] text-sky-300 uppercase">
                Atendimento que vira oportunidade
              </p>
              <h2 className="allbusiness-auth-enter allbusiness-auth-enter-three mt-5 max-w-xl text-5xl leading-[1.04] font-bold tracking-[-0.045em] text-white xl:text-6xl">
                Cada conversa já nasce com um próximo passo.
              </h2>
              <p className="allbusiness-auth-enter allbusiness-auth-enter-four mt-6 max-w-lg text-lg leading-8 text-slate-300">
                WhatsApp, vendas e inteligência artificial trabalhando no mesmo fluxo — com contexto
                para o time e nenhuma oportunidade esquecida.
              </p>

              <ol
                className="allbusiness-auth-flow allbusiness-auth-enter allbusiness-auth-enter-five relative mt-12 grid grid-cols-3 gap-3"
                aria-label="Fluxo de atendimento da plataforma"
              >
                {[
                  ["01", "Conversa", "Tudo chega organizado"],
                  ["02", "Contexto", "A IA entende e registra"],
                  ["03", "Próximo passo", "O time sabe o que fazer"],
                ].map(([numero, titulo, detalhe]) => (
                  <li key={numero} className="allbusiness-auth-flow-step relative pt-5">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-sky-400">
                      {numero}
                    </span>
                    <strong className="mt-2 block text-sm font-bold text-white">{titulo}</strong>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">{detalhe}</span>
                  </li>
                ))}
                <span className="allbusiness-auth-flow-pulse" aria-hidden="true" />
              </ol>
            </div>

            <p className="allbusiness-auth-enter allbusiness-auth-enter-five font-mono text-[11px] tracking-[0.18em] text-slate-500 uppercase">
              Ambiente seguro · Dados da sua operação
            </p>
          </section>

          <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:bg-white/[0.025] lg:backdrop-blur-[2px]">
            <div className="w-full max-w-[29rem]">
              <div className="allbusiness-auth-enter allbusiness-auth-enter-one mb-8 flex justify-center lg:hidden">
                {marca.logoUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      data-testid="logo-da-fachada-movel"
                      src={marca.logoUrl}
                      alt={marca.nome}
                      className="h-20 w-auto max-w-[15rem] object-contain"
                    />
                  </>
                ) : marcaEhADoProduto({ name: marca.nome, logoUrl: null }) ? (
                  <LogotipoDoProduto nome={marca.nome} className="h-11 w-auto" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight">{marca.nome}</p>
                )}
              </div>

              <div className="allbusiness-auth-card allbusiness-auth-enter allbusiness-auth-enter-three rounded-[1.75rem] border border-white/10 bg-white/[0.075] p-6 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-9">
                {children}
              </div>

              <div className="allbusiness-auth-enter allbusiness-auth-enter-five mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                Acesso protegido à sua operação
              </div>
            </div>
          </section>
        </main>
      </div>
    </IdiomaProvider>
  );
}
