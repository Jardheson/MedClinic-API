import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors/AppError';

export function validateRequest(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((i) => `${i.path.join('.')} — ${i.message}`);
        return next(new BadRequestError(`Dados inválidos: ${messages.join('; ')}`));
      }
      next(error);
    }
  };
}
