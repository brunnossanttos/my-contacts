import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';
import { throwServiceError } from '../shared/common/service-error.util';

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

  findAll() {
    return `This action returns all contacts`;
  }

  async findOne(id: string): Promise<Contact> {
    try {
      const contact = await this.contactsRepo.findOneBy({ id });

      if (!contact) {
        throw new NotFoundException(`Contact with id "${id}" not found`);
      }

      return contact;
    } catch (error) {
      throwServiceError(error, 'Error to find contact');
    }
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
