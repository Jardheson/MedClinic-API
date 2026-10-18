import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors/AppError';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error('[MedClinic-API][AppError]', err);
    }
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      error: err.error,
      message: err.message,
    });
  }

  console.error('[MedClinic-API][UnhandledError]', err);
  return res.status(500).json({
    statusCode: 500,
    error: 'ERRO_INTERNO',
    message: 'Erro interno do servidor.',
  });
};
