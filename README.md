### command to run postgres without persistance

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

### command to login to psql terminal in docker

```bash
psql -h localhost -U myuser -p 5432 -d mydb
```

### install backend dependencies

```bash
npm i
```

### start the server

```bash
npm run dev
```

> the server would be running now on http://localhost:3000/

### TechStack used

- Apple

  - Swift Ui
  - XCODE
  - SDIMAGEVIEWER library
  - NEUMORPHIC LIBRARY

- FIREBASE SDK

  - Firebase Authentication
  - Firebase Firestore
  - Firebase Storage
  - Firebase CrashAnalytics

- SERVER SIDE
  - JAVASCRIPT
  - NODE JS
  - EXPRESS JS
  - Firebase library
  - NODE CRON
