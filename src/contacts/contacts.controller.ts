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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PaginatedContactsDto } from './dto/paginated-contacts.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiCreatedResponse({ type: Contact, description: 'Contact created' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiConflictResponse({ description: 'Cellphone already in use' })
  async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return await this.contactsService.create(createContactDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List contacts with filters and pagination' })
  @ApiOkResponse({ type: PaginatedContactsDto })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Partial name (ILIKE)',
  })
  @ApiQuery({
    name: 'cellphone',
    required: false,
    description: 'Partial cellphone (ILIKE)',
  })
  @ApiQuery({ name: 'favorite', required: false, example: true })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 30 })
  async findAll(
    @Query() query: FindAllContactsDto,
  ): Promise<IPaginatedResult<Contact>> {
    return await this.contactsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a contact by ID' })
  @ApiOkResponse({ type: Contact, description: 'Contact found' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  async findOne(@Param('id') id: string) {
    return await this.contactsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a contact by id' })
  @ApiOkResponse({ type: Contact, description: 'Updated contact' })
  @ApiNotFoundResponse({ description: 'Contact not found' })
  @ApiConflictResponse({ description: 'Cellphone already in use' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    return await this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a contact by id' })
  @ApiNoContentResponse({ description: 'Contact deleted' })
  @ApiNotFoundResponse({ description: 'Contact not found' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  async remove(@Param('id') id: string) {
    return await this.contactsService.remove(id);
  }

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Mark or unmark a contact as favorite' })
  @ApiOkResponse({ type: Contact, description: 'Favorite state updated' })
  @ApiNotFoundResponse({ description: 'Contact not found' })
  @ApiParam({ name: 'id', description: 'Contact UUID' })
  async updateFavorite(
    @Param('id') id: string,
    @Body() dto: UpdateFavoriteDto,
  ): Promise<Contact> {
    return await this.contactsService.updateFavorite(id, dto);
  }
}
