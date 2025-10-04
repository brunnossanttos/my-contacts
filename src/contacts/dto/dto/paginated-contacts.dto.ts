import { ApiProperty } from '@nestjs/swagger';
import { Contact } from '../../entities/contact.entity';

export class PaginatedContactsDto {
  @ApiProperty({ type: [Contact] })
  data: Contact[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 30 })
  limit: number;

  @ApiProperty({ example: 123 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
