## Deploying Requirements ##

I added this file to be the guide for me to follow whenever
new modifications made in the code base and redeploying is
a must. So I will never just forget necessary configs needed
and scratch my head why the setup is not working.

1. Make sure the endpoint of the frontend is set properly.

    got to /ovida/frontend/src/constants/urls.js

    modify the the urls variable to backend's url to make requests.

2. Build the frontend.

```bash
npm run build
```

    I actually provide rsync command in this root directory to upload
    in server.

3. I used cloudflare for tunneling as well as nginx as my proxy
    server therefore the daemon name is nginx and cloudflared.

- sudo systemctl status nginx
- sudo systemctl status cloudflared

