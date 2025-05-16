import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { inject, injectable } from 'tsyringe';
import { validate } from '@shared/validation/validator';
import {
  CreateCustomerUseCase,
  UpdateCustomerUseCase,
  GetCustomerByIdUseCase,
  DeleteCustomerUseCase,
  ListCustomersUseCase,
} from '@application/loan/customer-use-cases';
import { ICustomerRepository } from '@domain/loan/repositories/customer-repository.interface';
import { PaginationMeta, toCustomerDto } from './dtos';
import { createLogger } from '@shared/logging/logger';

@injectable()
export class CustomerController {
  private readonly logger = createLogger('CustomerController');

  private readonly createCustomerUseCase: CreateCustomerUseCase;
  private readonly updateCustomerUseCase: UpdateCustomerUseCase;
  private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase;
  private readonly deleteCustomerUseCase: DeleteCustomerUseCase;
  private readonly listCustomersUseCase: ListCustomersUseCase;

  // Validation schemas
  private readonly createCustomerSchema = z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
  });

  private readonly updateCustomerSchema = z
    .object({
      fullName: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
    })
    .refine(data => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    });

  private readonly paginationSchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
  });

  constructor(@inject('ICustomerRepository') customerRepository: ICustomerRepository) {
    this.createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
    this.updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
    this.getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepository);
    this.deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);
    this.listCustomersUseCase = new ListCustomersUseCase(customerRepository);

    this.logger.info('CustomerController initialized');
  }

  registerRoutes(router: Router): void {
    this.logger.info('Registering customer routes');

    // Create a new customer
    router.post('/customers', this.createCustomer.bind(this));

    // Get a customer by ID
    router.get('/customers/:id', this.getCustomerById.bind(this));

    // Update a customer
    router.patch('/customers/:id', this.updateCustomer.bind(this));

    // Delete a customer
    router.delete('/customers/:id', this.deleteCustomer.bind(this));

    // List all customers
    router.get('/customers', this.listCustomers.bind(this));
  }

  // Create a new customer
  private async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validate(this.createCustomerSchema, req.body);
      const customer = await this.createCustomerUseCase.execute(data);

      res.statusCode = 201;
      res.json({
        data: toCustomerDto(customer),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get a customer by ID
  private async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.statusCode = 400;
        res.json({
          error: {
            message: 'Invalid customer ID',
          },
        });
        return;
      }

      const customer = await this.getCustomerByIdUseCase.execute(id);

      res.statusCode = 200;
      res.json({
        data: toCustomerDto(customer),
      });
    } catch (error) {
      next(error);
    }
  }

  // Update a customer
  private async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.statusCode = 400;
        res.json({
          error: {
            message: 'Invalid customer ID',
          },
        });
        return;
      }

      const validData = validate(this.updateCustomerSchema, req.body);
      // Create a properly typed object for the use case
      const updateData: { fullName?: string; email?: string } = {};
      if ('fullName' in validData && validData.fullName !== undefined) {
        updateData.fullName = validData.fullName;
      }
      if ('email' in validData && validData.email !== undefined) {
        updateData.email = validData.email;
      }

      const updatedCustomer = await this.updateCustomerUseCase.execute(id, updateData);

      res.status(200).json({
        data: toCustomerDto(updatedCustomer),
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a customer
  private async deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: {
            message: 'Invalid customer ID',
          },
        });
        return;
      }

      await this.deleteCustomerUseCase.execute(id);

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  // List all customers
  private async listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams = validate(this.paginationSchema, req.query);

      // Create a properly typed object for the use case
      const paginationParams = {
        page: queryParams.page,
        pageSize: queryParams.pageSize,
      };

      const result = await this.listCustomersUseCase.execute(paginationParams);

      const pagination: PaginationMeta = {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      };

      res.status(200).json({
        data: result.customers.map(toCustomerDto),
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
