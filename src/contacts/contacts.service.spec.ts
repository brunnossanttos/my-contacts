import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { ObjectLiteral, Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

type MockRepo<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const mockContactRepo = (): MockRepo<Contact> => ({
  create: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
});

describe('ContactsService', () => {
  let service: ContactsService;
  let contactRepo: MockRepo<Contact>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactRepo(),
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    contactRepo = module.get(getRepositoryToken(Contact));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a contact (happy path)', async () => {
      const dto: CreateContactDto = {
        name: 'Bruno Santos',
        cellphone: '11999999999',
      };

      const entity: Contact = { id: uuidv4(), ...dto };

      contactRepo.create!.mockReturnValue(entity);
      contactRepo.save!.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(contactRepo.create).toHaveBeenCalledWith(dto);
      expect(contactRepo.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });

    it('should throw InternalServerErrorException when repo.save fails', async () => {
      const dto: CreateContactDto = {
        name: 'Erro Teste',
        cellphone: '11000000000',
      };

      const entity = { ...dto } as unknown as Contact;

      contactRepo.create!.mockReturnValue(entity);
      contactRepo.save!.mockRejectedValue(new Error('db down'));

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );

      expect(contactRepo.create).toHaveBeenCalledWith(dto);
      expect(contactRepo.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findOne', () => {
    it('should return a contact when found', async () => {
      const id = uuidv4();
      const contact: Contact = {
        id,
        name: 'Bruno Santos',
        cellphone: '11999999999',
      };

      contactRepo.findOneBy!.mockResolvedValue(contact);

      const result = await service.findOne(id);

      expect(contactRepo.findOneBy).toHaveBeenCalledTimes(1);
      expect(contactRepo.findOneBy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(contact);
    });

    it('should throw NotFoundException when not found', async () => {
      const id = uuidv4();
      contactRepo.findOneBy!.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(contactRepo.findOneBy).toHaveBeenCalledWith({ id });
    });
  });
});
