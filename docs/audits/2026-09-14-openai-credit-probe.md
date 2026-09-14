# Correção da prova de crédito OpenAI

O onboarding recebia HTTP 400 `unsupported_parameter` porque a prova enviava
`max_tokens` ao modelo configurado. A OpenAI usa `max_completion_tokens` neste
endpoint; o limite continua sendo um token, incluindo raciocínio. Não se troca
modelo, credencial, timeout ou endpoint, nem se acrescentam tentativas.

Fonte: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create

## Evidência

- Linux, Node 22, Vitest 4.1.11, contêiner isolado sem rede nem credenciais reais.
- Novos testes contra implementação anterior: 3 falhas e 13 sucessos.
- Mesmos testes com correção: 16 sucessos. Reintroduzir o campo antigo é a
  mutação já exercitada pela execução anterior, que reprova três testes.
- Cobertura: corpo de OpenAI para dois modelos, serialização no fetch, uma chamada,
  limite mínimo e preservação de Anthropic, OpenRouter e Google.
- Esta prova não equivale a uma conversa completa de atendimento. Validação visual,
  teste real da API e implantação ainda devem ser conferidos separadamente.

## Living System Checklist

1. Entrada: `GET /api/v1/system/instalacao?provar=1`, autorização admin e credencial
   resolvida pela instalação ou organização no handler existente.
2. Saída: `provarSaldo` devolve `ResultadoDaProva` à mesma rota, sem novo contrato.
3. Registro: resposta diagnóstica com código/status normalizados; não grava
   `llm_calls`, conforme separação explícita de diagnóstico e orçamento existente.
4. Tela: `app/onboarding/setup-ai/_inteligencia.tsx` renderiza sucesso ou erro.
5. Porta: etapa de inteligência do onboarding existente, nenhuma rota nova.
6. Anti-morte: timeout de oito segundos, falha explícita; nenhuma fila criada.
7. Configuração: mantém provedor, modelo e chave da etapa de inteligência.
8. Continuidade: nenhuma alteração a atendimento ou handoff IA/humano.
9. Retorno: erro chega ao operador para correção e novo teste; não se troca chave
   ou modelo automaticamente. Não há decisão autônoma de atendimento neste teste.
10. Mapa: nenhuma peça/aresta nova; mesmas rota, função e tela. `graphify` não
    disponível; consumidores localizados por busca textual no repositório.

Sem alteração de schema, RLS, permissões, dados ou mensagens de clientes.
