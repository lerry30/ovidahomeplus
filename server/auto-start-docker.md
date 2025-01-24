The daemon config for auto start docker.

Verify these things first

1. Check Docker path
```bash
    which docker
```

2. Check Docker socket permissions
```bash
    ls -l /var/run/docker.sock
```

3. Verify Docker service status
```bash
    systemctl status docker.service
```

4. Verify user and permissions
```bash
    whoami
    groups
```

Create daemon file
```bash
/etc/systemd/system/docker-containers.service
```

Set the user from the output of 'whoami', to User and WorkingDirectory

```bash
    [Unit]
    Description=Docker Containers Startup
    After=docker.service network.target
    Requires=docker.service

    [Service]
    Type=oneshot
    RemainAfterExit=yes
    User=ovida
    Group=docker
    WorkingDirectory=/home/ovida
    ExecStart=/bin/bash -c '/usr/bin/docker start $(/usr/bin/docker ps -aq --filter "status=exited")'

    [Install]
    WantedBy=multi-user.target
```

Run these commands:
```bash
sudo systemctl daemon-reload
sudo systemctl enable docker-containers.service
sudo systemctl start docker-containers.service
```

