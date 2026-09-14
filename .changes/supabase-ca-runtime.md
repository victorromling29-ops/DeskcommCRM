---
impacto: nada_mudou
secao: corrigido
titulo: Conexão com certificado Supabase validado no runtime
---

O empacotamento do fork confia no CA público oficial do Supabase em app e worker,
preservando a verificação TLS e evitando reinícios por cadeia não reconhecida.
Nenhum fluxo de produto, contrato HTTP ou schema foi alterado.
