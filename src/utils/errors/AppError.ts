export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = statusCode < 500;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Requisição inválida.') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado.') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso proibido.') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflito de dados.') {
    super(message, 409);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado.') {
    super(message, 404);
  }
}
