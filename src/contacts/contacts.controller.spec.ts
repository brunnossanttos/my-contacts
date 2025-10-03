import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from './entities/contact.entity';
import { NotFoundException } from '@nestjs/common';

describe('ContactsController', () => {
  let contactsController: ContactsController;

  const serviceMock = {
    create: jest.fn(),
    findOne: jest.fn(),
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
});
