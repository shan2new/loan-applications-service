# Authentication Module

This module implements a flexible authentication system using the Strategy pattern, allowing for different authentication mechanisms to be used interchangeably.

## Current Implementation

The current implementation uses a simple token-based authentication strategy using an environment variable:

- Token: Set via `API_ACCESS_TOKEN` environment variable
- Header: `x-access-token`

## Architecture

- `IAuthStrategy`: Interface that all authentication strategies must implement
- `TokenAuthStrategy`: Implementation of token-based authentication
- `AuthService`: Service that manages authentication strategies and creates middleware
- `auth-middleware.ts`: Provides middleware functions for route protection

## Security Features

1. **Token-based Authentication**: All API routes are protected by default except for health check endpoints
2. **Rate Limiting**:
   - Global rate limiting: 100 requests per 15 minutes per IP
   - Stricter auth endpoint rate limiting: 5 requests per hour
3. **Security Headers**:
   - Content Security Policy (CSP)
   - XSS Protection
   - Frame protection (deny)
   - MIME sniffing protection
   - Hide server information
4. **CORS Configuration**:
   - Configurable origins
   - Restricted methods and headers
   - Credentials support

## Adding New Authentication Strategies

To add a new authentication strategy:

1. Create a new class implementing the `IAuthStrategy` interface
2. Register the strategy with the `AuthService`
3. Use the strategy by name when creating middleware

Example:

```typescript
// 1. Create strategy
@injectable()
export class JwtAuthStrategy implements IAuthStrategy {
  readonly name = 'jwt';

  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    // JWT verification logic
  }
}

// 2. Register strategy
const authService = getAuthService();
authService.registerStrategy(new JwtAuthStrategy());

// 3. Use strategy
router.get('/protected', authenticate('jwt'), controller.handler);
```

## Best Practices

- Always use HTTPS in production
- Rotate tokens/secrets regularly
- Implement proper logging for security events
- Consider adding additional security measures like CSRF protection for cookie-based auth
- Store sensitive values like tokens in environment variables, never hardcode them
