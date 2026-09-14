# Tema visual AllBusiness

## Direção

- **Paleta clara:** fundo gelo `#f4f7fb`, cartões brancos, superfície elevada
  `#eaf1f8`, texto grafite-azulado `#0f1f33` e bordas `#d7e0ea`.
- **Paleta escura:** fundo marinho `#07111f`, cartões `#0d1928`, superfície
  elevada `#152438`, texto gelo `#f2f7fc` e bordas `#22354a`.
- **Ação:** rampa azul derivada da semente `#076eae`; o tom 600 mantém contraste
  AA com texto branco e o tom 500 mantém o indicador de foco acima de 3:1.
- **Semântica:** verde não é mais cor estrutural. Ele continua somente onde quer
  dizer sucesso; âmbar, vermelho e azul informativo mantêm seus significados.
- **Assinatura:** hierarquia em camadas de aço — fundo frio, superfícies claras e
  profundidade azul discreta — em continuidade com o logo AllBusiness.

## Living System Checklist

1. Entrada: `app/globals.css` e `PALETTES.allbusiness` são as fontes visuais.
2. Saída: utilitários Tailwind e aliases shadcn alimentam todas as telas existentes.
3. Registro: nenhuma mutação de domínio; o fragmento em `.changes/` registra a entrega.
4. Tela: a mudança aparece na casca, painéis, cartões, controles e tela pública.
5. Porta: todas as rotas existentes recebem os tokens; nenhuma rota nova é criada.
6. Anti-morte: o teste `allbusiness-tema.test.ts` impede o retorno do bege e da sálvia.
7. Configuração: a cor de uma instalação ainda pode ser sobrescrita pela marca em
   runtime; superfícies globais permanecem coerentes em azul e cinza.
8. Continuidade: não altera atendimento, automações nem passagem IA↔humano.
9. Laço de retorno: testes de contraste medem cada papel contra cada superfície;
   qualquer tom abaixo do piso reprova a suíte.
10. Mapa: nenhuma peça ou aresta funcional nova; a régua congelada foi sincronizada
    com o CSS que já alimenta o produto.

Sem schema, RLS, API, autenticação, dados ou permissões alterados.
