import {
  ConflictException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

type MysqlDriverError = { code?: string; errno?: number };

function extractMysqlDriverError(e: QueryFailedError): MysqlDriverError {
  const rawDriver: unknown = (e as unknown as { driverError?: unknown })
    .driverError;
  const out: MysqlDriverError = {};
  if (rawDriver && typeof rawDriver === 'object') {
    const d = rawDriver as Record<string, unknown>;
    if (typeof d.code === 'string') out.code = d.code;
    if (typeof d.errno === 'number') out.errno = d.errno;
  }
  return out;
}

export function throwServiceError(
  error: unknown,
  context = 'Operation',
  logger?: Logger,
): never {
  if (logger) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`${context}: ${msg}`);
  }

  if (error instanceof HttpException) {
    throw error;
  }

  if (error instanceof QueryFailedError) {
    const { code, errno } = extractMysqlDriverError(error);
    if (code === 'ER_DUP_ENTRY' || errno === 1062) {
      throw new ConflictException(`${context}: duplicate entry`);
    }
  }

  throw new InternalServerErrorException(`${context}: internal server error`);
}
