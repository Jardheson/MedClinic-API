import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors/AppError';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error('[MedClinic-API][AppError]', err);
    }
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      timestamp,
    });
  }

  console.error('[MedClinic-API][UnhandledError]', err);
  return res.status(500).json({
    statusCode: 500,
    message: 'Erro interno do servidor.',
    timestamp,
  });
};
