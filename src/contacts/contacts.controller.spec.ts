import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from './entities/contact.entity';
import { NotFoundException } from '@nestjs/common';
import { IPaginatedResult } from '../shared/common/pagination-result.interface';

describe('ContactsController', () => {
  let contactsController: ContactsController;

  const serviceMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    contactsController = module.get<ContactsController>(ContactsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(contactsController).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the created contact', async () => {
      const dto: CreateContactDto = {
        name: 'Bruno Santos',
        cellphone: '11999999999',
      };

      const created: Contact = {
        id: uuidv4(),
        name: dto.name,
        cellphone: dto.cellphone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      serviceMock.create.mockResolvedValue(created);

      const result = await contactsController.create(dto);

      expect(serviceMock.create).toHaveBeenCalledTimes(1);
      expect(serviceMock.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return the contact', async () => {
      const id = uuidv4();
      const contact: Contact = {
        id,
        name: 'Bruno Santos',
        cellphone: '11999999999',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      serviceMock.findOne.mockResolvedValue(contact);

      const result = await contactsController.findOne(id);

      expect(serviceMock.findOne).toHaveBeenCalledTimes(1);
      expect(serviceMock.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(contact);
    });

    it('should throw NotFoundException when contact is not found', async () => {
      const id = uuidv4();
      serviceMock.findOne.mockRejectedValue(
        new NotFoundException(`Contact with id "${id}" not found`),
      );

      await expect(contactsController.findOne(id)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(serviceMock.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with query and return paginated result', async () => {
      const query = { name: 'bru', cellphone: '1199', page: 2, limit: 5 };

      const pageResult: IPaginatedResult<Contact> = {
        data: [
          {
            id: uuidv4(),
            name: 'Bruno',
            cellphone: '11990000001',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: uuidv4(),
            name: 'Bruna',
            cellphone: '11990000002',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
      };

      serviceMock.findAll.mockResolvedValue(pageResult);

      const result = await contactsController.findAll(query as any);

      expect(serviceMock.findAll).toHaveBeenCalledTimes(1);
      expect(serviceMock.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(pageResult);
    });

    it('should use defaults when query is empty', async () => {
      const query = {};

      const pageResult: IPaginatedResult<Contact> = {
        data: [],
        page: 1,
        limit: 30,
        total: 0,
        totalPages: 1,
      };

      serviceMock.findAll.mockResolvedValue(pageResult);

      const result = await contactsController.findAll(query as any);

      expect(serviceMock.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(pageResult);
    });

    it('should propagate service errors', async () => {
      const query = { name: 'erro' };
      serviceMock.findAll.mockRejectedValue(new Error('boom'));

      await expect(contactsController.findAll(query as any)).rejects.toThrow(
        'boom',
      );
      expect(serviceMock.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('update', () => {
    it('should call service.update and return the updated contact', async () => {
      const id = uuidv4();
      const dto = { name: 'Updated Name', cellphone: '11988887777' };

      const updated: Contact = {
        id,
        name: dto.name,
        cellphone: dto.cellphone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!serviceMock.update) serviceMock.update = jest.fn();
      serviceMock.update.mockResolvedValue(updated);

      const result = await contactsController.update(id, dto as any);

      expect(serviceMock.update).toHaveBeenCalledTimes(1);
      expect(serviceMock.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from service.update', async () => {
      const id = uuidv4();
      const dto = { name: 'Qualquer' };

      if (!serviceMock.update) serviceMock.update = jest.fn();
      serviceMock.update.mockRejectedValue(
        new NotFoundException(`Contact with id "${id}" not found`),
      );

      await expect(
        contactsController.update(id, dto as any),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(serviceMock.update).toHaveBeenCalledWith(id, dto);
    });
  });
});
