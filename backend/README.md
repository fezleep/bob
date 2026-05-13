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
- Maven 3.9+
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

Use the Spring datasource variables when you need to override the full JDBC connection directly.

## Run

From `/backend`:

```bash
mvn spring-boot:run
```

## Test and build

```bash
mvn test
mvn package
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
