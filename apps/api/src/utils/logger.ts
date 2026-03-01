import pino from 'pino';

// pino-pretty is only available in non-test, non-production environments
const isTest = process.env.NODE_ENV === 'test';
const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
  transport:
    !isTest && !isProd
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
