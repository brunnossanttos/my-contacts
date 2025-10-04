import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { FindOperator, ObjectLiteral, Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FindAllContactsDto } from './dto/find-all-contacts.dto';

type MockRepo<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const mockContactRepo = (): MockRepo<Contact> => ({
  create: jest.fn(),
  findOneBy: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
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

      const entity: Contact = {
        id: uuidv4(),
        ...dto,
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

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
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
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

  describe('findAll', () => {
    it('should return paginated result with filters (name + cellphone)', async () => {
      const dto: FindAllContactsDto = {
        name: 'bru',
        cellphone: '1199',
        page: 2,
        limit: 5,
      };

      const rows: Contact[] = [
        {
          id: '1',
          name: 'Bruno Santos',
          cellphone: '11990000001',
          favorite: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Bruna Neves',
          cellphone: '11990000002',
          favorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      contactRepo.findAndCount!.mockResolvedValue([rows, 12]);

      const result = await service.findAll(dto);

      expect(contactRepo.findAndCount).toHaveBeenCalledTimes(1);

      const arg = contactRepo.findAndCount!.mock.calls[0][0] as {
        skip: number;
        take: number;
        order: { createdAt: 'DESC' };
        where: { name?: any; cellphone?: any };
      };

      expect(arg.skip).toBe((dto.page! - 1) * dto.limit!);
      expect(arg.take).toBe(dto.limit);
      expect(arg.order).toEqual({ name: 'ASC' });

      expect(arg.where.name).toBeInstanceOf(FindOperator);
      expect(arg.where.cellphone).toBeInstanceOf(FindOperator);
      expect((arg.where.name as FindOperator<string>).value).toBe('%bru%');
      expect((arg.where.cellphone as FindOperator<string>).value).toBe(
        '%1199%',
      );

      expect(result).toEqual({
        data: rows,
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
      });
    });

    it('should work without filters and use default pagination', async () => {
      const dto: FindAllContactsDto = {};
      contactRepo.findAndCount!.mockResolvedValue([[], 0]);

      const result = await service.findAll(dto);

      const arg = contactRepo.findAndCount!.mock.calls[0][0] as {
        skip: number;
        take: number;
        order: { createdAt: 'DESC' };
        where: { name?: any; cellphone?: any };
      };
      expect(arg.where).toEqual({});
      expect(arg.skip).toBe(0);
      expect(arg.take).toBe(30);

      expect(result).toEqual({
        data: [],
        page: 1,
        limit: 30,
        total: 0,
        totalPages: 1,
      });
    });

    it('should propagate errors from repository', async () => {
      const dto: FindAllContactsDto = { name: 'x' };
      contactRepo.findAndCount!.mockRejectedValue(new Error('db down'));

      await expect(service.findAll(dto)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
      await expect(service.findAll(dto)).rejects.toThrow(
        'Error to find contacts: internal server error',
      );
    });
  });

  describe('update (preload)', () => {
    it('should update and save when contact exists', async () => {
      const id = uuidv4();
      const dto = { name: 'Updated Name', cellphone: '11991112222' };

      const merged: Contact = {
        id,
        name: dto.name,
        cellphone: dto.cellphone,
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contactRepo.preload!.mockResolvedValue(merged);
      contactRepo.save!.mockImplementation(async (entity: Contact) => ({
        ...entity,
        updatedAt: new Date(),
      }));

      const result = await service.update(id, dto as any);

      expect(contactRepo.preload).toHaveBeenCalledWith({ id, ...dto });
      expect(contactRepo.save).toHaveBeenCalledTimes(1);
      expect(result.name).toBe(dto.name);
      expect(result.cellphone).toBe(dto.cellphone);
    });

    it('should propagate NotFoundException when preload returns undefined', async () => {
      const id = uuidv4();
      contactRepo.preload!.mockResolvedValue(undefined);

      await expect(
        service.update(id, { name: 'x' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);

      await expect(service.update(id, { name: 'x' } as any)).rejects.toThrow(
        `Contact with id "${id}" not found`,
      );

      expect(contactRepo.preload).toHaveBeenCalledWith({ id, name: 'x' });
      expect(contactRepo.save).not.toHaveBeenCalled();
    });

    it('should wrap unique violation into InternalServerErrorException (since throwServiceError encapsulates)', async () => {
      const id = uuidv4();
      const dto = { cellphone: '11998887777' };

      const merged: Contact = {
        id,
        name: 'Bruno Santos',
        cellphone: dto.cellphone,
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      contactRepo.preload!.mockResolvedValue(merged);

      const uniqueErr = Object.assign(new Error('duplicate key'), {
        code: '23505',
      });
      contactRepo.save!.mockRejectedValue(uniqueErr);

      await expect(service.update(id, dto as any)).rejects.toMatchObject({
        name: 'InternalServerErrorException',
        message: 'Error to update contact: internal server error',
      });
    });

    it('should wrap other errors into InternalServerErrorException', async () => {
      const id = uuidv4();
      const dto = { name: 'x' };

      const merged: Contact = {
        id,
        name: 'x',
        cellphone: '11990000000',
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      contactRepo.preload!.mockResolvedValue(merged);
      contactRepo.save!.mockRejectedValue(new Error('db down'));

      await expect(service.update(id, dto as any)).rejects.toMatchObject({
        name: 'InternalServerErrorException',
        message: 'Error to update contact: internal server error',
      });
    });
  });

  describe('remove', () => {
    it('should delete contact and resolve void when affected > 0', async () => {
      const id = uuidv4();
      (contactRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await expect(service.remove(id)).resolves.toBeUndefined();
      expect(contactRepo.delete).toHaveBeenCalledTimes(1);
      expect(contactRepo.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when affected is 0', async () => {
      const id = uuidv4();
      (contactRepo.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.remove(id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(contactRepo.delete).toHaveBeenCalledWith(id);
    });

    it('should wrap unexpected errors into InternalServerErrorException', async () => {
      const id = uuidv4();
      (contactRepo.delete as jest.Mock).mockRejectedValue(new Error('db down'));

      await expect(service.remove(id)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
      await expect(service.remove(id)).rejects.toThrow(
        'Error to remove contact: internal server error',
      );

      expect(contactRepo.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('updateFavorite', () => {
    it('should update and save favorite when contact exists', async () => {
      const id = uuidv4();
      const dto = { favorite: true };

      const merged: Contact = {
        id,
        name: 'Bruno Santos',
        cellphone: '11999999999',
        favorite: dto.favorite,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contactRepo.preload!.mockResolvedValue(merged);
      contactRepo.save!.mockImplementation(async (entity: Contact) => ({
        ...entity,
        updatedAt: new Date(),
      }));

      const result = await service.updateFavorite(id, dto as any);

      expect(contactRepo.preload).toHaveBeenCalledTimes(1);
      expect(contactRepo.preload).toHaveBeenCalledWith({ id, favorite: true });
      expect(contactRepo.save).toHaveBeenCalledTimes(1);
      expect(result.favorite).toBe(true);
    });

    it('should default favorite=true when dto is empty', async () => {
      const id = uuidv4();

      const merged: Contact = {
        id,
        name: 'Bruno',
        cellphone: '11990000000',
        favorite: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contactRepo.preload!.mockResolvedValue(merged);
      contactRepo.save!.mockResolvedValue(merged);

      const result = await service.updateFavorite(id, {} as any);

      expect(contactRepo.preload).toHaveBeenCalledWith({ id, favorite: true });
      expect(result.favorite).toBe(true);
    });

    it('should propagate NotFoundException when preload returns undefined', async () => {
      const id = uuidv4();
      contactRepo.preload!.mockResolvedValue(undefined);

      await expect(
        service.updateFavorite(id, { favorite: false } as any),
      ).rejects.toBeInstanceOf(NotFoundException);

      await expect(
        service.updateFavorite(id, { favorite: false } as any),
      ).rejects.toThrow(`Contact with id "${id}" not found`);

      expect(contactRepo.preload).toHaveBeenCalledWith({ id, favorite: false });
      expect(contactRepo.save).not.toHaveBeenCalled();
    });

    it('should wrap repository.save errors into InternalServerErrorException', async () => {
      const id = uuidv4();
      const dto = { favorite: false };

      const merged: Contact = {
        id,
        name: 'Bruno',
        cellphone: '11990000000',
        favorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contactRepo.preload!.mockResolvedValue(merged);
      contactRepo.save!.mockRejectedValue(new Error('db down'));

      await expect(
        service.updateFavorite(id, dto as any),
      ).rejects.toMatchObject({
        name: 'InternalServerErrorException',
        message: 'Error to update favorite: internal server error',
      });
    });
  });
});
