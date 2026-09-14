# CA público do Supabase

`supabase-ca.crt` é um certificado público, não uma chave privada. Origem HTTPS:
https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

URL confirmada em `apps/studio/hooks/custom-content/custom-content.json` do
repositório oficial `supabase/supabase`, campo `ssl:certificate_url`, em 14/09/2026.

Fingerprint SHA-256 X.509:
`80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`.
Validade: 28/04/2021 a 26/04/2031. SHA-256 do arquivo PEM:
`700723581420dd1ac98fd7e9ac529f0ef210eadcaf87fc868a3ad7d114c2f3b7`.

O Compose monta o diretório somente para leitura em app e worker. Node carrega
o CA adicional ao iniciar; `SUPABASE_DB_URL` deve usar `sslmode=verify-full` para
validar cadeia e hostname. Não desligar a verificação TLS para contornar erros.

Ao renovar o CA, conferir origem, validade e fingerprint e reiniciar app e worker.
Manter os dois arquivos Compose (produção e Traefik) nesta instalação Hostinger.
