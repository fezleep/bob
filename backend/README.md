# bob backend

Spring Boot backend for bob.

## Stack

- Java 21
- Spring Boot 3
- Maven
- PostgreSQL
- Flyway
- springdoc OpenAPI

## Local prerequisites

- Java 21
- Maven Wrapper included in this project
- Docker Compose for PostgreSQL

Start the database from the repository root:

```bash
docker compose up -d
```

## Configuration

The backend uses environment variables with local defaults that match `docker-compose.yml`.

| Variable | Default |
| --- | --- |
| `SERVER_PORT` | `8080` |
| `POSTGRES_HOST` | `localhost` |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_DB` | `bob` |
| `POSTGRES_USER` | `bob` |
| `POSTGRES_PASSWORD` | `bob` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/bob` |
| `SPRING_DATASOURCE_USERNAME` | `bob` |
| `SPRING_DATASOURCE_PASSWORD` | `bob` |
| `BOB_APP_VERSION` | `0.1.0` |
| `BOB_AI_ENABLED` | `false` |
| `BOB_AI_MODEL` | empty |
| `OPENAI_API_KEY` | empty |
| `BOB_AI_DEBUG_RESPONSE_SHAPE` | `false` |

Use the Spring datasource variables when you need to override the full JDBC connection directly.

`OPENAI_API_KEY` is used only by the backend for lead "Bob read" generation. Never commit a real key and never expose it through frontend or `NEXT_PUBLIC_` variables. Use different secrets for local, dev, and production.

AI is off by default so local setup and CI do not require OpenAI credentials. To enable Bob read generation locally, set all three values in the backend environment and restart the backend:

```bash
BOB_AI_ENABLED=true
BOB_AI_MODEL=<model-available-to-your-openai-account>
OPENAI_API_KEY=<your-openai-api-key>
```

If AI is disabled, `OPENAI_API_KEY` is empty, or `BOB_AI_MODEL` is empty, the API returns an unavailable state instead of generating an insight. If AI is disabled after insights already exist, saved insights can still be returned for display, but regeneration stays unavailable.

For local provider debugging only, `BOB_AI_DEBUG_RESPONSE_SHAPE=true` logs a heavily sanitized and truncated provider response sample. Leave it unset or `false` in normal local runs, CI, dev, and production. The default parsing logs include only safe response metadata such as status, body length, top-level field names, and output/content item types.

## Run

From `/backend`:

```bash
./mvnw spring-boot:run
```

## Current API Scope

- Auth: register, login, and current-user lookup
- Leads: create, list, detail, update, and status change
- Lead context: notes and activity timeline
- Follow-ups: optional next follow-up timestamp on lead create/update
- Attention queue: overdue and due-today follow-ups at `GET /api/leads/attention`
- Bob read: latest saved insight lookup and user-triggered generation
- System: `/api/status` and `/actuator/health`
- API docs: Swagger UI and OpenAPI JSON

## API documentation

When the backend is running locally:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

In production, use the deployed backend origin with the same paths:

- Swagger UI: `<backend-origin>/swagger-ui/index.html`
- OpenAPI JSON: `<backend-origin>/v3/api-docs`

## Test and build

```bash
./mvnw test
./mvnw package
```

## Verify locally

Health check:

```bash
curl http://localhost:8080/actuator/health
```

Application status:

```bash
curl http://localhost:8080/api/status
```

OpenAPI document:

```bash
curl http://localhost:8080/v3/api-docs
```

Production recovery and deployment troubleshooting:
[../docs/production-recovery.md](../docs/production-recovery.md)

Oracle Cloud Always Free backend and PostgreSQL deployment:
[../docs/oracle-deployment.md](../docs/oracle-deployment.md)

Flyway migration:

```bash
docker compose exec postgres psql -U bob -d bob -c "select installed_rank, version, description, success from flyway_schema_history order by installed_rank;"
docker compose exec postgres psql -U bob -d bob -c "select key, value from app_metadata;"
```
