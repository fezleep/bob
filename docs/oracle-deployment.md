# Oracle Cloud Always Free Deployment

This guide prepares Bob for a low-cost long-running deployment with:

- Frontend on Vercel
- Spring Boot backend in Docker on an Oracle Cloud Always Free Linux VM
- PostgreSQL in Docker on the same VM

This setup does not require Oracle credentials in the repository. Do not commit the VM `.env` file or real secrets.

## Prerequisites

- Oracle Cloud account with an Always Free compute instance
- Linux VM, ideally Ubuntu 22.04 or 24.04
- SSH access to the VM
- VM boot volume sized with enough room for Docker images, logs, and PostgreSQL data
- Ingress opened for SSH (`22`) and the backend port (`8080`) in the Oracle network security list or network security group
- Docker Engine and the Docker Compose plugin installed on the VM

Optional later: put Nginx, Caddy, or another reverse proxy in front of the backend for HTTPS and a custom domain. This branch intentionally keeps that out of the compose file.

## Install Docker On The VM

Use Docker's current Linux installation steps for the VM operating system. For Ubuntu, the end state should be:

```bash
docker --version
docker compose version
```

If you want to run Docker without `sudo`, add the VM user to the `docker` group and reconnect:

```bash
sudo usermod -aG docker "$USER"
```

## Clone Bob

```bash
git clone <repository-url> bob
cd bob
git checkout infra/oracle-deploy-foundation
```

## Configure Environment

Create the VM-only environment file:

```bash
cp infra/oracle/.env.example infra/oracle/.env
```

Edit `infra/oracle/.env` and replace all placeholder secrets.

Required backend and database variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `POSTGRES_DB` | yes | Database created by the Postgres container. |
| `POSTGRES_USER` | yes | Database user created by the Postgres container. |
| `POSTGRES_PASSWORD` | yes | Strong database password. |
| `SPRING_DATASOURCE_URL` | yes | Use `jdbc:postgresql://postgres:5432/<POSTGRES_DB>` for this compose network. |
| `SPRING_DATASOURCE_USERNAME` | yes | Usually the same value as `POSTGRES_USER`. |
| `SPRING_DATASOURCE_PASSWORD` | yes | Usually the same value as `POSTGRES_PASSWORD`. |
| `BOB_AUTH_JWT_SECRET` | yes | Long stable JWT signing secret. Changing it logs users out. |
| `BOB_AUTH_JWT_EXPIRATION_MINUTES` | recommended | Positive session lifetime in minutes. |
| `BOB_APP_VERSION` | recommended | Version label returned by `/api/status`. |
| `SERVER_PORT` | yes | Backend container port, normally `8080`. |
| `BACKEND_PORT` | yes | VM host port published to the internet, normally `8080`. |

Optional AI variables supported by the current backend:

| Variable | Required | Notes |
| --- | --- | --- |
| `BOB_AI_ENABLED` | no | Keep `false` unless Bob read generation is configured. |
| `BOB_AI_MODEL` | only for AI | Model available to the backend environment's OpenAI account. |
| `OPENAI_API_KEY` | only for AI | Backend-only secret. Never expose through Vercel `NEXT_PUBLIC_*` variables. |
| `BOB_AI_DEBUG_RESPONSE_SHAPE` | no | Keep `false` in production. |

Generate secrets on your own machine or the VM. Example:

```bash
openssl rand -base64 48
```

## Start Services

From the repository root on the VM:

```bash
docker compose -f infra/oracle/docker-compose.yml up -d --build
```

Check containers:

```bash
docker compose -f infra/oracle/docker-compose.yml ps
docker compose -f infra/oracle/docker-compose.yml logs backend
```

## Verify Backend Health

From the VM:

```bash
curl -i http://localhost:8080/actuator/health
curl -i http://localhost:8080/api/status
```

From your local machine, after the Oracle security list allows the backend port:

```bash
curl -i http://<oracle-vm-public-ip>:8080/actuator/health
curl -i http://<oracle-vm-public-ip>:8080/api/status
```

Expected results:

- `/actuator/health` returns HTTP 200 with status `UP`.
- `/api/status` returns HTTP 200 with app name, status `ok`, and version.

API documentation uses conventional Spring Boot springdoc paths on the deployed backend origin:

- Swagger UI: `http://<oracle-vm-public-ip>:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://<oracle-vm-public-ip>:8080/v3/api-docs`

If you later put HTTPS and a custom domain in front of the backend, keep the same paths on that backend origin.

## Connect Vercel Frontend

In the Vercel project settings, set:

```bash
NEXT_PUBLIC_API_BASE_URL=http://<oracle-vm-public-ip>:8080
```

For a real production domain, prefer HTTPS through a reverse proxy and then set the Vercel value to the HTTPS backend origin. Do not include a trailing path.

The frontend also supports:

```bash
BOB_AUTH_COOKIE_DOMAIN=
```

Leave it unset unless you intentionally share auth across a custom root domain and subdomains.

Redeploy the Vercel frontend after changing environment variables.

## Backup Notes

PostgreSQL data lives in the Docker volume named `oracle_postgres-data` or `<compose-project>_postgres-data`, depending on the compose project name.

Simple logical backup from the VM:

```bash
docker compose -f infra/oracle/docker-compose.yml exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > bob-backup.sql
```

If the shell does not have those variables loaded, use the values from `infra/oracle/.env`.

Store backups outside the VM when possible. A VM boot volume is not a backup.

## Troubleshooting

### Backend Cannot Connect To Database

- Confirm Postgres is healthy: `docker compose -f infra/oracle/docker-compose.yml ps`
- Confirm `SPRING_DATASOURCE_URL` uses host `postgres`, not `localhost`.
- Confirm `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` match the Postgres variables.
- Check backend logs: `docker compose -f infra/oracle/docker-compose.yml logs backend`

### Migrations Fail

- Check the backend startup logs for the Flyway error.
- Confirm the database volume was not initialized with a different app schema.
- Do not edit existing Flyway migration files to recover production data.
- If this is a fresh VM and you can discard data, recreate the volume only after confirming no production data is needed.

### Vercel Cannot Reach Backend

- From your local machine, curl the backend public origin.
- Confirm Oracle ingress allows `BACKEND_PORT`, normally `8080`.
- Confirm the VM firewall allows the port if a host firewall is enabled.
- Confirm Vercel `NEXT_PUBLIC_API_BASE_URL` points to the backend origin, not `localhost` or an old Railway URL.

### Auth Appears Broken Because API Is Offline

- Check `http://<backend-origin>/actuator/health` first.
- Check `http://<backend-origin>/api/status`.
- If either endpoint is down, fix backend or database availability before changing auth code.
- Keep `BOB_AUTH_JWT_SECRET` stable across backend restarts and rebuilds.

### Firewall Or Security List Port Not Open

- Oracle security list or network security group must allow inbound TCP traffic for the backend port.
- The VM operating system firewall must also allow the port if enabled.
- The compose file publishes `${BACKEND_PORT:-8080}` on the VM host.

## Stop Or Restart

```bash
docker compose -f infra/oracle/docker-compose.yml restart backend
docker compose -f infra/oracle/docker-compose.yml down
```

`down` stops containers but keeps the named Postgres volume. Do not delete volumes unless you intentionally want to remove database data.
