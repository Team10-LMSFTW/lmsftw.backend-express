#### command to run postgres without persistance

```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  postgres

```

### command to run postgres with persistance

```bash

docker run -d --name postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \  # Mount a volume named postgres_data
  postgres

```
