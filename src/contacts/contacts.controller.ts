import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { FindAllContactsDto } from './dto/find-all-contacts.dto';
import { IPaginatedResult } from '../shared/common/pagination-result.interface';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return await this.contactsService.create(createContactDto);
  }

  @Get()
  async findAll(
    @Query() query: FindAllContactsDto,
  ): Promise<IPaginatedResult<Contact>> {
    return await this.contactsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.contactsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    return await this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.contactsService.remove(id);
  }
}
