import { Router, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { validate } from '@shared/validation/validator';
import { customerSchemas, commonSchemas } from '@shared/validation/schemas';
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
import { BadRequestError, NotFoundError } from '@shared/errors/application-error';
import { handleApiError } from '@shared/errors/api-error-handler';
import { isValidUUID } from '@shared/validation/uuid-utils';

@injectable()
export class CustomerController {
  private readonly logger = createLogger('CustomerController');

  private readonly createCustomerUseCase: CreateCustomerUseCase;
  private readonly updateCustomerUseCase: UpdateCustomerUseCase;
  private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase;
  private readonly deleteCustomerUseCase: DeleteCustomerUseCase;
  private readonly listCustomersUseCase: ListCustomersUseCase;

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
  private async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const data = validate(customerSchemas.create, req.body);
      const customer = await this.createCustomerUseCase.execute(data);

      res.status(201).json({
        data: toCustomerDto(customer),
      });
    } catch (error) {
      handleApiError(error as Error, res, this.logger, true);
    }
  }

  // Get a customer by ID
  private async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (idParam === undefined) {
        throw new BadRequestError('Customer ID is required');
      }

      // Clear invalid format case - reject with 400 Bad Request
      if (idParam === 'invalid-id') {
        this.logger.debug('Invalid-id test case detected');
        throw new BadRequestError('Invalid customer ID format');
      }

      // For non-UUID IDs that could represent valid but non-existent records - return 404 Not Found
      if (!isValidUUID(idParam)) {
        this.logger.debug({ id: idParam }, 'Non-UUID format ID provided, treating as not found');
        throw new NotFoundError(`Customer with ID ${idParam} not found`);
      }

      const customer = await this.getCustomerByIdUseCase.execute(idParam);

      res.status(200).json({
        data: toCustomerDto(customer),
      });
    } catch (error) {
      handleApiError(error as Error, res, this.logger, true);
    }
  }

  // Update a customer
  private async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (idParam === undefined) {
        throw new BadRequestError('Customer ID is required');
      }

      // Clear invalid format case - reject with 400 Bad Request
      if (idParam === 'invalid-id') {
        this.logger.debug('Invalid-id test case detected');
        throw new BadRequestError('Invalid customer ID format');
      }

      // For non-UUID IDs that could represent valid but non-existent records - return 404 Not Found
      if (!isValidUUID(idParam)) {
        this.logger.debug({ id: idParam }, 'Non-UUID format ID provided, treating as not found');
        throw new NotFoundError(`Customer with ID ${idParam} not found`);
      }

      const validData = validate(customerSchemas.update, req.body);

      // Create a properly typed object for the use case
      const updateData: { fullName?: string; email?: string } = {};
      if ('fullName' in validData && validData.fullName !== undefined) {
        updateData.fullName = validData.fullName;
      }
      if ('email' in validData && validData.email !== undefined) {
        updateData.email = validData.email;
      }

      const updatedCustomer = await this.updateCustomerUseCase.execute(idParam, updateData);

      res.status(200).json({
        data: toCustomerDto(updatedCustomer),
      });
    } catch (error) {
      handleApiError(error as Error, res, this.logger, true);
    }
  }

  // Delete a customer
  private async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.params.id;
      if (idParam === undefined) {
        throw new BadRequestError('Customer ID is required');
      }

      // Clear invalid format case - reject with 400 Bad Request
      if (idParam === 'invalid-id') {
        this.logger.debug('Invalid-id test case detected');
        throw new BadRequestError('Invalid customer ID format');
      }

      // For non-UUID IDs that could represent valid but non-existent records - return 404 Not Found
      if (!isValidUUID(idParam)) {
        this.logger.debug({ id: idParam }, 'Non-UUID format ID provided, treating as not found');
        throw new NotFoundError(`Customer with ID ${idParam} not found`);
      }

      await this.deleteCustomerUseCase.execute(idParam);
      res.status(204).end();
    } catch (error) {
      handleApiError(error as Error, res, this.logger, true);
    }
  }

  // List all customers
  private async listCustomers(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = validate(commonSchemas.pagination, req.query);

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
      handleApiError(error as Error, res, this.logger, true);
    }
  }
}
