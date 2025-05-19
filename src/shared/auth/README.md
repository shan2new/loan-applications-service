# Authentication Module

This module implements a flexible authentication system using the Strategy pattern, allowing for different authentication mechanisms to be used interchangeably.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Current Implementation](#current-implementation)
- [Security Features](#security-features)
- [How to Use](#how-to-use)
- [Adding New Authentication Strategies](#adding-new-authentication-strategies)
- [Testing Authentication](#testing-authentication)
- [Security Best Practices](#security-best-practices)

## Overview

The authentication module is designed around the Strategy Pattern, making it easy to swap out different authentication mechanisms without changing the consuming code. This approach allows the service to:

- Support multiple authentication mechanisms simultaneously
- Add new authentication methods without modifying existing code
- Apply consistent security policies across different authentication strategies

## Architecture

The authentication system is built with the following components:

1. **IAuthStrategy Interface** (`auth-strategy.interface.ts`)

   - Core contract that all authentication strategies must implement
   - Defines the `authenticate` method that verifies credentials
   - Contains a name property to identify the strategy

2. **TokenAuthStrategy** (`token-auth-strategy.ts`)

   - Implementation of token-based authentication
   - Validates the `x-access-token` header against configured value
   - Provides default implementation for the application

3. **AuthService** (`auth-service.ts`)

   - Manages multiple authentication strategies
   - Creates middleware for Express routes
   - Allows registration of new strategies at runtime

4. **Auth Middleware** (`auth-middleware.ts`)
   - Provides ready-to-use middleware functions
   - Implements global authentication that can be bypassed for specific routes
   - Contains utilities for working with authentication in routes

## Current Implementation

The current implementation uses a simple token-based authentication strategy:

```typescript
// Configuration (in environment variables)
API_ACCESS_TOKEN="your-secure-token-here"

// Header in requests
x-access-token: your-secure-token-here
```

### Token Authentication Flow

1. Client includes the token in the `x-access-token` header
2. The `TokenAuthStrategy` compares the provided token with the environment variable
3. If matching, the request proceeds; otherwise, a 401 Unauthorized response is returned

## Security Features

The authentication module integrates with several other security features:

1. **Token-based Authentication**:

   - All API routes require authentication by default
   - Health check endpoints (`/health`) are exempt from authentication
   - Configurable via environment variables

2. **Rate Limiting**:

   - Global rate limiting: 100 requests per 15 minutes per IP
   - Authentication endpoint limiting: 5 requests per minute
   - Helps prevent brute force and DoS attacks

3. **Security Headers**:

   - Content Security Policy (CSP)
   - X-XSS-Protection
   - X-Frame-Options (deny)
   - X-Content-Type-Options (nosniff)
   - Referrer-Policy (no-referrer)
   - Strict-Transport-Security (HSTS)

4. **CORS Configuration**:
   - Configurable allowed origins via `CORS_ORIGINS` environment variable
   - Restricted methods and headers
   - Credentials support for authenticated cross-origin requests
