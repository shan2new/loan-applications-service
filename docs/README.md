# Loan Applications Service Documentation

This directory contains documentation resources for the Loan Applications Service.

## Architecture Diagrams

- `architecture-diagram.png` - High-level architecture overview showing the Clean Architecture layers
- `infrastructure-diagram.png` - AWS infrastructure diagram showing deployment components

## API Documentation

The project uses TypeDoc to automatically generate API documentation from the source code. The generated documentation is stored in the `/docs/api` directory.

### Generating API Documentation

To generate or update the API documentation:

```bash
# Generate API documentation
npm run docs:generate

# View documentation in browser
npm run docs:serve
```

The generated documentation provides:

- Class and interface documentation
- Method signatures and descriptions
- Type information
- Module structure

## Additional Documentation

### Architecture

- [Domain-Driven Design Patterns](domain-driven-design.md) - Explanation of how DDD is implemented in this service
- [Hexagonal Architecture](hexagonal-architecture.md) - Details on the Ports and Adapters pattern implementation

### Development

- [API Endpoints](api-endpoints.md) - Complete API documentation with examples
- [Testing Strategy](testing-strategy.md) - Overview of the testing approach

### Operations

- [Deployment Guide](deployment-guide.md) - Step-by-step guide for deployment
- [Monitoring Setup](monitoring.md) - Information on monitoring and alerting

## Contributing to Documentation

When adding new features, please update the relevant documentation files and consider adding architecture diagrams for complex components. For diagrams, use draw.io or similar tools and export as PNG and editable source files.

### Documenting Code

To ensure your code is properly included in the API documentation:

1. Use JSDoc comments for classes, methods, and properties
2. Include `@param` tags for parameters
3. Add `@returns` tags for return values
4. Use `@example` tags to provide usage examples

Example:

```typescript
/**
 * Calculates the monthly payment for a loan
 *
 * @param principal - The loan amount
 * @param interestRate - Annual interest rate as percentage (e.g., 5.0 for 5%)
 * @param termMonths - Duration of the loan in months
 * @returns The calculated monthly payment amount
 *
 * @example
 * const payment = calculatePayment(10000, 5.0, 36);
 * // Returns approximately 299.71
 */
function calculatePayment(principal: number, interestRate: number, termMonths: number): number {
  // Implementation
}
```
