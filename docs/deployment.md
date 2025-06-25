# Deployment Guide

This guide provides detailed instructions for deploying and managing the **Shrimp Task Manager** using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose)
- [Building the Docker Image Manually](#building-the-docker-image-manually)
- [Running the Container](#running-the-container)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Data Persistence](#data-persistence)
- [Connecting a Client](#connecting-a-client)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/): Ensure Docker is installed and the Docker daemon is running.
- [Docker Compose](https://docs.docker.com/compose/install/): (Recommended) For easy management of the container.
- [Git](https://git-scm.com/downloads): For cloning the repository.

## Quick Start with Docker Compose

This is the recommended method for running the Shrimp Task Manager.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
    cd mcp-shrimp-task-manager
    ```

2.  **Start the Service**
    ```bash
    docker-compose up --build -d
    ```
    This command will:
    - Build the Docker image based on the `Dockerfile`.
    - Create and start a container in detached mode (`-d`).
    - Map port 3000 on your host to port 3000 in the container.
    - Create a Docker volume named `shrimp_data` to persist task data.

3.  **Verify the Service**
    You can check if the container is running with:
    ```bash
    docker-compose ps
    ```
    And view the logs with:
    ```bash
    docker-compose logs -f
    ```
    You should see output indicating the server has started successfully.

4.  **Stopping the Service**
    ```bash
    docker-compose down
    ```
    This will stop and remove the container. The data will remain in the `shrimp_data` volume.

## Building the Docker Image Manually

If you prefer not to use Docker Compose, you can build the image directly.

```bash
docker build -t shrimp-task-manager .
```
This command builds a Docker image from the `Dockerfile` in the current directory and tags it as `shrimp-task-manager`.

## Running the Container

Once the image is built, you can run it as a container.

```bash
docker run -d \
  -p 3000:3000 \
  --name shrimp-server \
  -v shrimp_data:/usr/src/app/data \
  -e "MCP_PORT=3000" \
  -e "DATA_DIR=/usr/src/app/data" \
  --restart unless-stopped \
  shrimp-task-manager
```

## Configuration

### Environment Variables

You can configure the container using environment variables. When using `docker-compose.yml`, you can set them in the `environment` section. When using `docker run`, use the `-e` flag.

-   `MCP_PORT`: The port the server listens on inside the container. Defaults to `3000`.
-   `DATA_DIR`: The directory inside the container where task data, logs, and other files are stored. Defaults to `/usr/src/app/data`.
-   `TEMPLATES_USE`: The language template to use. Supports `en` and `zh`. Defaults to `en`.

### Data Persistence

The server stores task history and other data in the `DATA_DIR`. To ensure this data is not lost when the container is stopped or removed, a Docker volume is used.

The `docker-compose.yml` file automatically creates and manages a named volume called `shrimp_data`. If you are using `docker run`, you can create and manage the volume manually.

## Connecting a Client

To connect a client like Cursor, update your `mcp.json` file to point to the server's URL.

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```
The server will maintain a session for your client automatically.

## Troubleshooting

-   **Port Conflicts**: If you get an error that `address already in use`, it means another service is running on port 3000. You can either stop the other service or change the host port mapping in your `docker-compose.yml` or `docker run` command (e.g., `-p 3001:3000`).
-   **Permission Errors**: If you encounter permission errors related to the data volume on Linux hosts, you may need to ensure the directory on the host that is mounted into the container has the correct permissions.
-   **Check Logs**: The first step in troubleshooting is always to check the container logs: `docker-compose logs` or `docker logs shrimp-server`. 