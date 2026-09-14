---
impacto: nada_mudou
secao: corrigido
titulo: Teste da chave OpenAI aceita modelos com tokens de raciocínio
---

O teste de crédito no onboarding usa `max_completion_tokens` na OpenAI,
evitando a rejeição do parâmetro antigo `max_tokens`. Mantém o modelo escolhido,
uma única chamada curta e limitada a 256 tokens, com espaço para raciocínio.
Outros provedores não mudam. A tela aguarda o teste antes de anunciar sucesso.
Não exige trocar chaves, configurar o banco nem reinstalar o CRM.
