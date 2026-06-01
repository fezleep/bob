# bob

<p align="left">
  <img src="frontend/public/branding/bob-logo.png" alt="logo do bob" width="72" />
</p>

bob é um workspace fullstack para gestão de leads, fluxos operacionais e inteligência contextual.

Ele foi construído com cara de produto SaaS real: frontend e backend separados, autenticação, rotas protegidas, PostgreSQL, CI, testes smoke, documentação e uma interface pensada para deixar o trabalho com leads mais claro e menos barulhento.

Versão em inglês: [README.md](README.md)

## o que é

bob é um workspace operacional para acompanhar leads sem precisar entrar direto em um CRM pesado.

Na prática, ele junta cadastro de leads, filtros, busca contextual, pipeline kanban, detalhes do lead, notas, histórico de atividades, ações rápidas e command palette em uma experiência só. A ideia não é tentar ser todas as ferramentas de vendas ao mesmo tempo. A ideia é mostrar o que está acontecendo, o que precisa de atenção e qual deve ser o próximo movimento.

Para recrutadores, bob é um projeto de portfólio com pensamento de produto. Para tech leads, é uma base fullstack com separação clara entre frontend e backend, arquitetura pragmática e espaço para crescer sem fingir que o roadmap já está pronto.

## por que existe

Muitas ferramentas operacionais ficam complexas antes do fluxo estar claro.

bob começa pelo fluxo:

- leads precisam ser fáceis de escanear
- status precisa aparecer sem abrir tudo
- detalhes devem entrar na hora certa
- busca e filtros precisam ajudar o trabalho real
- o código precisa continuar compreensível conforme o produto cresce

O projeto também mostra meu jeito de construir: produto primeiro, arquitetura com motivo, decisões pequenas bem documentadas e um roadmap honesto sobre o que já existe e o que ainda é futuro.

## preview do produto / screenshots

As screenshots foram capturadas em desenvolvimento local. A validação em produção ainda está pendente porque o ambiente da Railway teve instabilidade externa durante essa etapa.

| Home | Workspace |
| --- | --- |
| ![tela inicial do bob](docs/assets/screenshots/home.png) | ![workspace do bob](docs/assets/screenshots/workspace.png) |

| Pipeline | Leads |
| --- | --- |
| ![pipeline kanban do bob](docs/assets/screenshots/pipeline.png) | ![lista de leads do bob](docs/assets/screenshots/leads.png) |

| Preview do lead | Command palette |
| --- | --- |
| ![drawer de preview do lead](docs/assets/screenshots/lead-preview.png) | ![command palette do bob](docs/assets/screenshots/command-palette.png) |

| Login | About |
| --- | --- |
| ![tela de login do bob](docs/assets/screenshots/login.png) | ![tela about do bob](docs/assets/screenshots/about.png) |

## principais funcionalidades

Implementado hoje:

- gestão de leads com criação, listagem, detalhe, edição e mudança de status
- pipeline kanban agrupado por status do lead
- ações no detalhe do lead, notas e histórico de atividades
- sinais de inteligência para leads recentes, parados e que precisam de atenção
- filtros inteligentes e busca contextual nos dados dos leads
- command palette para navegação e ações rápidas
- drawer lateral para preview de lead
- progressive disclosure para mostrar detalhe sem poluir a tela
- login, registro, usuário atual e logout
- Spring Security com autenticação JWT
- rotas operacionais protegidas no frontend
- APIs protegidas no backend
- persistência com PostgreSQL e migrações Flyway
- ambiente local com Docker Compose
- CI com GitHub Actions
- testes smoke com Playwright
- documentação de arquitetura, roadmap, produto, marca e decisões técnicas

## stack técnica

| Área | Tecnologia atual |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Java 21, Spring Boot 3.3, Spring Web, Spring Security, Spring Data JPA, Bean Validation |
| Banco | PostgreSQL 16, Flyway |
| Infra local | Docker Compose |
| Qualidade | Maven tests, Spring Boot tests, ESLint, Next.js build, Playwright smoke tests, GitHub Actions |

Redis, RabbitMQ, OpenAI API, Prometheus, Grafana, OpenTelemetry, AWS RDS, AWS ECS/EKS, Terraform e Kubernetes são itens de roadmap. Eles não fazem parte da implementação atual.

## arquitetura

bob usa uma arquitetura com frontend e backend separados:

```text
Next.js frontend
  -> acesso tipado de API em frontend/lib
  -> API REST com Spring Boot
  -> Spring Data JPA
  -> PostgreSQL
```

O backend hoje é um monolito modular. Essa escolha é proposital. Para esta fase, uma aplicação backend única deixa o desenvolvimento local, as transações e o setup mais simples, mas ainda permite organizar o código em módulos internos claros.

Áreas atuais do backend:

- `modules/auth`: registro, login, usuário atual, hash de senha com BCrypt e emissão de JWT
- `modules/leads`: fluxo de leads, notas, histórico de atividades e transições de status
- `modules/system`: status da aplicação
- `shared/api`: erros de API e tratamento de exceções
- `config`: segurança e configuração da aplicação

O frontend usa App Router do Next.js, componentes reutilizáveis e uma pequena camada de API. A experiência é pensada para operação: leitura rápida, pouco ruído visual, status claro e ações perto do contexto do lead.

Mais detalhes: [docs/architecture.md](docs/architecture.md)

## decisões de engenharia

Algumas escolhas do bob são simples de propósito:

- O backend começa como monolito modular, não como microserviços prematuros.
- PostgreSQL é a fonte da verdade.
- Flyway controla mudanças de schema.
- JWT protege as rotas operacionais sem trazer infraestrutura de sessão agora.
- O frontend conversa com o backend por helpers de API, sem acesso direto ao banco.
- A interface usa progressive disclosure para não virar uma parede de botões.
- O CI valida testes do backend, lint/build do frontend e smoke tests com Playwright.
- Infraestrutura futura fica documentada, mas não entra antes de existir uma necessidade real.

Mais detalhes: [docs/engineering-decisions.md](docs/engineering-decisions.md)

## como rodar localmente

Pré-requisitos:

- Java 21
- Maven Wrapper incluído em `backend`
- Node.js e npm
- Docker Compose

Suba o PostgreSQL na raiz do repositório:

```bash
docker compose up -d
```

Rode o backend:

```bash
cd backend
./mvnw spring-boot:run
```

Rode o frontend:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Configure a origem da API para o frontend:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Checks úteis do backend:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/status
```

## autenticação

bob já tem autenticação local implementada.

Fluxo atual:

- usuário pode se registrar
- usuário pode fazer login
- backend emite um JWT
- rotas protegidas do frontend verificam autenticação
- APIs operacionais do backend exigem bearer token
- usuário pode fazer logout pelo frontend

Valores locais de autenticação:

```bash
BOB_AUTH_JWT_SECRET=local-development-secret-change-me-please-32
BOB_AUTH_JWT_EXPIRATION_MINUTES=480
```

O secret padrão serve só para desenvolvimento local. Fora de demo local, use um secret forte.

Crie o primeiro usuário local pelo navegador:

```text
http://localhost:3000/register
```

Ou chame o backend direto:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Local User","email":"local@example.com","password":"password123"}'
```

## testes e ci

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
npm run test:e2e
```

O GitHub Actions roda validação de backend e frontend em pull requests. Os testes smoke com Playwright cobrem as primeiras verificações de navegador para páginas públicas, telas de auth, redirects de rotas protegidas e comportamento da command palette.

## roadmap

Próximos passos de produto:

- ownership de workspace
- responsável e datas de follow-up por lead
- ações mais ricas no lead
- views salvas para filtros operacionais comuns
- command palette mais forte para navegação e ações
- busca contextual mais rica em notas e histórico de atividades
- importação de listas de leads
- regras de acesso por papel
- refresh tokens, reset de senha, verificação de email e fluxo de convite

Inteligência futura:

- resumo de lead a partir de notas e atividades
- detecção de lead parado
- sugestão de próximo passo
- rascunho curto de follow-up
- integração com OpenAI API ligada a ações explícitas do fluxo

Infraestrutura futura, só quando fizer sentido:

- Redis
- RabbitMQ
- Prometheus e Grafana
- OpenTelemetry
- AWS RDS
- AWS ECS/EKS
- Terraform
- Kubernetes

Mais detalhes: [docs/roadmap.md](docs/roadmap.md)

## por que esse projeto importa

bob importa porque não é só um CRUD com uma tela bonita.

O projeto conecta decisões de produto, UX operacional, arquitetura de backend, autenticação, testes, documentação e disciplina de roadmap no mesmo lugar. Ele mostra como um produto estilo SaaS pode começar pequeno e ainda assim nascer com hábitos que ajudam o sistema a crescer melhor depois.

A versão atual ainda está evoluindo, mas a direção é clara: um workspace calmo para operação de leads, construído com estrutura técnica suficiente para continuar melhorando sem virar bagunça.

## autor

Criado por Felipe Virginio.

Product engineer e fullstack builder com foco forte em backend.

Mais docs:

- [Arquitetura](docs/architecture.md)
- [Decisões de engenharia](docs/engineering-decisions.md)
- [Direção de produto](docs/product.md)
- [Roadmap](docs/roadmap.md)
- [Notas de marca](docs/brand.md)
