# Desafio final — VTEX IO

Tema com formulário de leads integrado ao Master Data V1, três vitrines em abas, barra fixa de preços e selo de promoção.

[Ver o workspace](https://aaaaa--econverse.myvtex.com/)

## Requisitos

- Git, Node.js, Yarn Classic (1.x) e [VTEX CLI](https://developers.vtex.com/docs/guides/vtex-io-documentation-vtex-io-cli-installation-and-command-reference) instalados.
- Acesso à conta `econverse` e a um workspace de desenvolvimento.

## Como rodar

Clone o repositório e entre na pasta:

```sh
git clone https://github.com/Yuurih44/Desafio-FinalVTEX.git
cd Desafio-FinalVTEX
```

Faça login e selecione o workspace do desafio:

```sh
vtex login econverse
vtex use aaaaa
vtex whoami
```

Para testar em outro workspace de desenvolvimento, substitua `aaaaa` pelo nome dele. Confira a conta e o workspace no resultado de `vtex whoami` antes de continuar.

Na raiz do projeto, execute:

```sh
vtex link
```

A CLI instala as dependências de `react` e `node` e envia o projeto para compilação. Aguarde a mensagem `App linked successfully` e abra o endereço informado no terminal. Mantenha o comando em execução para sincronizar as alterações.

A execução acontece no workspace VTEX IO. A home contém o formulário e as vitrines; ao abrir um produto, aparecem a barra fixa de preços e o botão de adicionar ao carrinho. O selo aparece quando o preço de lista é maior que o preço de venda.

## Master Data

O formulário grava os dados na entidade `DF`, do Master Data V1:

| Campo | Tipo |
| --- | --- |
| `firstName` | Varchar 50 |
| `lastName` | Varchar 50 |
| `email` | Varchar 100 |
| `interestCategory` | Varchar 100 |
| `optIn` | Boolean |

Na conta `econverse`, os registros ficam no [Master Data](https://econverse.vtexcrm.com.br/), em **Desafio final → Leads do desafio final**.

A definição está em `masterdata/lead-entity.json`. Esse arquivo serve como referência: a entidade e sua estrutura precisam ser cadastradas e publicadas no Master Data; o `vtex link` não as cria. A entidade já está configurada na conta usada pelo desafio.

## Configurações da conta

O `manifest.json` está configurado para o vendor `econverse`. A vitrine de promoções usa a coleção `161` (Ofertas), definida em `store/blocks/shelves.jsonc`. Para executar em outra conta, adapte o vendor, a entidade do Master Data e a coleção ao ambiente de destino.

Base do tema: [VTEX Store Theme](https://github.com/vtex-apps/store-theme).
