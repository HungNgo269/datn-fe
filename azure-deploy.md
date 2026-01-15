# Azure App Service (Multi-Container + Nginx)

This guide deploys the Next.js frontend behind Nginx on Azure App Service
using Docker Compose. It assumes you will build images with the correct
`NEXT_PUBLIC_BACKEND_URL` at build time.

## 1) Build and push images to ACR

Replace placeholders:
- `<acr>`: your ACR name (e.g. `nextbookacr`)
- `<backend_url>`: public API URL (do not use `http://localhost:3000`)

```bash
az acr login -n <acr>

docker build -t <acr>.azurecr.io/nextbook-frontend:latest ./frontend ^
  --build-arg NEXT_PUBLIC_BACKEND_URL=<backend_url>

docker build -t <acr>.azurecr.io/nextbook-nginx:latest ./frontend/nginx

docker push <acr>.azurecr.io/nextbook-frontend:latest
docker push <acr>.azurecr.io/nextbook-nginx:latest
```

## 2) Configure App Service (Docker Compose)

Use `frontend/docker-compose.azure.yml` and replace `<acr>` with your ACR
name.

App Service settings:
- `WEBSITES_PORT=80`
- Enable “Continuous Deployment” if you want auto-redeploy on image updates

## 3) Custom domain (nextbook.vn)

Add the domain in App Service and update DNS records:
- A record to the App Service IP, or
- CNAME to `<app-name>.azurewebsites.net`

Then add an SSL cert in App Service.
