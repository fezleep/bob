# bob backend

Spring Boot backend for bob.

## Stack

- Java 21
- Spring Boot 3
- Maven
- PostgreSQL
- Flyway

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

Use the Spring datasource variables when you need to override the full JDBC connection directly.

`OPENAI_API_KEY` is used only by the backend for lead "Bob read" generation. Never commit a real key and never expose it through frontend or `NEXT_PUBLIC_` variables. Use different secrets for local, dev, and production.

AI is off by default so local setup and CI do not require OpenAI credentials. To enable Bob read generation locally, set all three values in the backend environment and restart the backend:

```bash
BOB_AI_ENABLED=true
BOB_AI_MODEL=<model-available-to-your-openai-account>
OPENAI_API_KEY=sk-...
```

If AI is disabled, `OPENAI_API_KEY` is empty, or `BOB_AI_MODEL` is empty, the API returns an unavailable state instead of generating an insight. If AI is disabled after insights already exist, saved insights can still be returned for display, but regeneration stays unavailable.

## Run

From `/backend`:

```bash
./mvnw spring-boot:run
```

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

Flyway migration:

```bash
docker compose exec postgres psql -U bob -d bob -c "select installed_rank, version, description, success from flyway_schema_history order by installed_rank;"
docker compose exec postgres psql -U bob -d bob -c "select key, value from app_metadata;"
```
