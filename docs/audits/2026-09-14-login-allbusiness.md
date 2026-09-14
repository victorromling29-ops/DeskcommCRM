# Fachada de acesso AllBusiness

## Direção

- **Assunto:** CRM de atendimento e vendas com IA; o login tem um único trabalho:
  devolver a pessoa à operação com confiança.
- **Paleta:** noite `#040914`, painel `#08111f`, azul `#0284c7`, sinal `#38bdf8`,
  texto `#ffffff` e apoio `#cbd5e1`.
- **Tipografia:** Atkinson Hyperlegible para leitura e títulos; IBM Plex Mono para
  status, sequência e pequenas etiquetas operacionais.
- **Layout:** narrativa e fluxo à esquerda; acesso em cartão translúcido à direita.
  No celular, a narrativa sai e o logo preserva a hierarquia.
- **Assinatura:** um pulso percorre Conversa → Contexto → Próximo passo. É o próprio
  CRM em miniatura, não uma animação ornamental.

O fundo transparente foi produzido pelo modo integrado de edição de imagem a partir
do arquivo fornecido pelo operador. O PNG final fica em `public/allbusiness-logo.png`.
O arquivo mantém canal alfa; a configuração da VPS usa URL HTTPS absoluta para que a
mesma identidade chegue à fachada e à barra lateral.

## Living System Checklist

1. Entrada: marca da instalação resolvida por `marcaDaSaida(null)` e credenciais do
   formulário existente.
2. Saída: `LoginForm` continua chamando `signInWithPassword` e redirecionando ao app.
3. Registro: autenticação e erros mantêm os registros existentes; sem nova mutação.
4. Tela: `app/(public)/layout.tsx` e `app/(public)/login/page.tsx`.
5. Porta: `/login`, já pública e alcançada pelos redirects de sessão.
6. Anti-morte: erros de credencial/rate limit continuam visíveis no próprio cartão.
7. Configuração: `APP_NAME`, `APP_LOGO_URL` e `APP_ACCENT_HEX` no `.env` da VPS.
8. Continuidade: não toca handoff ou atendimento IA↔humano.
9. Laço de retorno: erro mantém a pessoa no formulário com motivo; sucesso segue
   para a rota `next` ou `/app`.
10. Mapa: nenhuma peça ou aresta nova; somente a apresentação da porta existente.

Sem schema, RLS, API, autenticação ou permissões alterados.
