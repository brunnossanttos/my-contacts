import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { throwServiceError } from '../shared/common/service-error.util';
import { FindAllContactsDto } from './dto/find-all-contacts.dto';
import { IPaginatedResult } from '../shared/common/pagination-result.interface';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepo: Repository<Contact>,
  ) {}
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      const contact = this.contactsRepo.create(createContactDto);
      return await this.contactsRepo.save(contact);
    } catch (error) {
      throwServiceError(error, 'Error to create contact', this.logger);
    }
  }

  async findAll({
    name,
    cellphone,
    page = 1,
    limit = 30,
  }: FindAllContactsDto): Promise<IPaginatedResult<Contact>> {
    try {
      const where: FindOptionsWhere<Contact> = {};

      if (name) {
        where.name = ILike(`%${name}%`);
      }

      if (cellphone) {
        where.cellphone = ILike(`%${cellphone}%`);
      }

      const [data, total] = await this.contactsRepo.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return {
        data,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (error) {
      throwServiceError(error, 'Error to find contacts', this.logger);
    }
  }

  async findOne(id: string): Promise<Contact> {
    try {
      const contact = await this.contactsRepo.findOneBy({ id });

      if (!contact) {
        throw new NotFoundException(`Contact with id "${id}" not found`);
      }

      return contact;
    } catch (error) {
      throwServiceError(error, 'Error to find contact', this.logger);
    }
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    try {
      const merged = await this.contactsRepo.preload({
        id,
        ...updateContactDto,
      });

      if (!merged)
        throw new NotFoundException(`Contact with id "${id}" not found`);

      const saved = await this.contactsRepo.save(merged);
      return saved;
    } catch (error) {
      throwServiceError(error, 'Error to update contact', this.logger);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
