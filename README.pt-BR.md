# bob

software silencioso para times modernos.

bob é um workspace calmo, dark-first, para gestão de leads. Foi criado por
Felipe Virginio, product engineer e builder com foco em backend. A proposta é
parecer um produto real de startup: simples de entender, bem estruturado por
dentro e cuidadoso na experiência.

Construído com fluxos modernos assistidos por IA, com foco em clareza,
consistência e pensamento de produto.

## o que é bob

bob ajuda times a gerenciar leads, notas, mudanças de status e atividades
recentes em um workspace minimalista.

Para recrutadores e pessoas não técnicas, bob é um produto parecido com um CRM
pequeno, usado para acompanhar conversas com potenciais clientes. Para tech
leads, é uma base fullstack com backend em Spring Boot, banco PostgreSQL e
interface em Next.js.

## por que ele existe

Muitos CRMs ficam pesados antes de um time pequeno realmente precisar de tanto
processo. bob começa pelo caminho contrário: um fluxo de leads focado, dados
claros e uma interface calma.

O projeto também existe como uma peça madura de portfólio. Ele mostra critério
de produto, arquitetura de backend, execução de frontend, documentação e um
caminho prático para recursos futuros com IA sem transformar IA na personalidade
do produto.

## o que ele faz

bob hoje cobre o fluxo principal de leads:

- criar e listar leads
- acompanhar status do lead
- visualizar detalhes do lead
- adicionar notas ao lead
- revisar historico de atividades
- conectar frontend e backend por uma camada de API tipada

## stack técnica

- Backend: Java 21, Spring Boot 3, Spring Web, Spring Data JPA
- Banco de dados: PostgreSQL, Flyway
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Infraestrutura local: Docker Compose
- Testes: testes Spring Boot, lint/build no frontend

## arquitetura

bob comeca como um monolito modular.

O backend é uma única aplicação deployável com módulos internos claros. Isso
mantém o desenvolvimento local simples e deixa espaço para limites mais fortes
conforme o produto cresce.

Direção atual do backend:

- `modules/leads` concentra o fluxo de leads
- `modules/system` expõe o status do sistema
- `shared/api` centraliza tratamento de erros da API
- migrações Flyway definem o contrato do banco

O frontend usa o app router do Next.js com componentes reutilizáveis, telas por
rota e um pequeno cliente de API em `frontend/lib`.

## funcionalidades

- shell de aplicação dark-first
- lista de leads e visão de leads recentes
- paginas de detalhe do lead
- etiquetas de status
- suporte a notas e timeline de atividades
- estados de carregamento e erro
- migrações de schema no PostgreSQL
- validação no backend e respostas de erro da API
- documentação de produto, arquitetura, roadmap e marca

## como rodar localmente

Inicie o PostgreSQL:

```bash
docker compose up -d
```

Rode o backend:

```bash
cd backend
mvn spring-boot:run
```

Rode o frontend:

```bash
cd frontend
npm install
npm run dev
```

O frontend espera uma URL base para a API:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Checks úteis do backend:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/status
```

## status atual

bob está em fase MVP.

O backend contém domínio principal de leads, persistência, migrações, endpoints
de API, validação e testes. O frontend contém o shell da aplicação, telas de
leads, integração com API e a primeira versão da camada de apresentação do
produto.

## roadmap futuro

- autenticação e ownership por workspace
- datas de follow-up e ownership de leads
- filtros e busca mais ricos
- views salvas
- assistência discreta com IA para resumos, leads parados e sugestões de
  próximo passo
- pipeline de deploy
- bases de observabilidade

Recursos de IA devem estar ligados a fluxos úteis. bob não deve virar uma
interface barulhenta de assistente.

## autor

Criado por Felipe Virginio.

Product engineer / backend-focused builder.

## documentação

- `docs/product.md` explica a direção de produto.
- `docs/architecture.md` explica a abordagem de monolito modular.
- `docs/roadmap.md` descreve o caminho do MVP.
- `docs/brand.md` define a direção de apresentação e mascote.
- `README.md` contém a versão principal em inglês.
