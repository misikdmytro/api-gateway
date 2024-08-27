# API Gateway

## Description

This project is a custom API Gateway built using Node.js and Express.The implementation covers various features.

Currently implemented features:

-   routing
-   authentication
-   authorization
-   rate limiting

## Installation

1. Clone the repository
2. Run `yarn install` to install the dependencies
3. Start Redis server with `docker compose up -d redis`
4. Run `yarn start` to start the server on port 3000

## Testing

Run `yarn test` to run the tests

## CI

The project uses GitHub Actions for CI. The workflow is defined in [`.github/workflows/ci.yaml`](.github/workflows/ci.yaml)
