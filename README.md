# objectified-api

Objectified OpenAPI 3.1 API Specification.

## Purpose

This project provides the following artifacts for Objectified:

- [x] OpenAPI 3.1 Specification
- [ ] Database Schema Design

The design of this OpenAPI specification is to create a small set of the necessary
operations to create a time series object database from the ground up.

## Auto-generator

The auto-generator code included in this package is purpose-built to build `DAO`,
`DTO`, `Controller`, and `Service` code support for the [NestJS stack](https://nestjs.com/).

Support for [Fastify](https://fastify.dev/) coming soon!

### YAAG?

Why yet another auto-generator?  Mostly because this one operates with the OpenAPI 
3.1 Specification.

Most other auto-generators that exist are either 
[browser plugins](https://chromewebstore.google.com/detail/openapi-devtools/jelghndoknklgabjgaeppjhommkkmdii),
too limiting, [don't support OpenAPI 3.1](https://openapi-generator.tech/docs/generators/java/) or 
[too old and have not been maintained](https://github.com/mtennoe/swagger-typescript-codegen).

Source: [openapi.tools](https://openapi.tools/)

## Prerequisites

- @objectified/openapi-parser

## Note

This may become its own project in the objectified-framework.

## License

[Commercial-friendly Apache 2.0 License.](LICENSE)  100% Open Source.
