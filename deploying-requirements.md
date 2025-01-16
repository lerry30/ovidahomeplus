## Deploying Requirements ##

I added this file to be the guide for me to follow whenever
a new modifications made in the code base and redeploying is
a must. So I will never just forget necessary config needed
and scratch my head why the setup is not working.

1. Make sure URLs are updated in the frontend to properly
    reached the endpoint. Since I didn't include this file
    when rsync or update made.

- rsync -avP --exclude server/node_modules --exclude frontend/node_modules --exclude server/.env --exclude frontend/src/constants/urls.js --exclude server/backend/uploads --exclude .git --exclude local  ~/Desktop/ovida ovida@192.168.1.254:~/

2. I used cloudflare for tunneling as well as nginx as my proxy
    server therefore the daemon name is nginx and cloudflared.

- sudo systemctl status nginx
- sudo systemctl status cloudflared

