## Simple Guide for Starting up Docker ##

Display if docker already running.
```bash
docker ps
```

If not try to display if there are containers hanging around.
```bash
docker ps -a
```

Remove docker containers & image if there is/are certain changes in codebase.
```bash
docker rm $(docker ps -a -q)
```

Then, remove image.
```bash
docker rmi backend
```

Terminate all even instances of volumes.
```bash
docker system prune -a --volumes
```

Build a fresh new image.
```bash
docker build -t backend .
```

Create docker containers.
```bash
docker compose up -d
```

Keep in mind that commands should be executed in the root directory
of the docker configurations(Dockerfile, docker-compose.yml)

