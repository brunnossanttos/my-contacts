import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('contacts')
@Unique(['cellphone'])
export class Contact {
  @ApiProperty({
    format: 'uuid',
    example: '9c1f4bc8-0b68-4d8a-8f7e-7f0b4ab1a8a2',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Bruno Santos' })
  @Column()
  name: string;

  @ApiProperty({
    example: '11999999999',
    description: 'Unique cellphone number',
  })
  @Column()
  cellphone: string;

  /* @Column()
  favorite: boolean; */

  @ApiProperty({ type: String, format: 'date-time' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @UpdateDateColumn()
  updatedAt: Date;
}
