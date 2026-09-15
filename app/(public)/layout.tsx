import { LogotipoDoProduto } from "@/components/branding/MarcaDoProduto";
import { marcaEhADoProduto } from "@/lib/branding";
import { marcaDaSaida } from "@/lib/branding/saida";
import { createClient } from "@/lib/supabase/server";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";
import styles from "./acesso.module.css";

/** Fachada da instalação: tema claro local, sem apagar a preferência do usuário.
 * A identidade da organização só é resolvida depois de entrar. */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const marca = await marcaDaSaida(null);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const locale = (user?.user_metadata?.locale as string | undefined) ?? null;

  return (
    <IdiomaProvider locale={locale}>
      <div data-theme="light" className={styles.shell}>
        <main className={styles.layout}>
          <section className={styles.intro} aria-label={`Sobre ${marca.nome}`}>
            <header className={styles.brand}>
              {marca.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  data-testid="logo-da-fachada"
                  src={marca.logoUrl}
                  alt={marca.nome}
                  className={styles.logo}
                />
              ) : marcaEhADoProduto({ name: marca.nome, logoUrl: null }) ? (
                <LogotipoDoProduto nome={marca.nome} className="h-14 w-auto" />
              ) : (
                <p className="text-3xl font-bold tracking-tight">{marca.nome}</p>
              )}
              <span className={styles.caption}>Relacionamento & negócios</span>
            </header>
            <div className={styles.story}>
              <p className={styles.eyebrow}>Seu espaço de trabalho</p>
              <h2 className={styles.headline}>
                Boas conversas.
                <br />
                <span>Novos negócios.</span>
              </h2>
              <p className={styles.description}>
                Seus contatos, atendimentos e oportunidades, juntos. Para você cuidar de cada
                relação e saber qual é o próximo passo.
              </p>
              <div className={styles.workspace} aria-label="Recursos do seu espaço de trabalho">
                <span>Conversas</span>
                <span>Oportunidades</span>
                <span>Equipe</span>
              </div>
            </div>
            <footer className={styles.footer}>Um lugar para acompanhar o que vem a seguir.</footer>
          </section>
          <section className={styles.access} aria-label="Acesso à plataforma">
            <div className={styles.card}>{children}</div>
            <p className={styles.security}>Sua conta. Sua equipe. Seu espaço.</p>
          </section>
        </main>
      </div>
    </IdiomaProvider>
  );
}
