export class AppError extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, error: string = 'ERRO_INTERNO') {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = statusCode < 500;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Dados inválidos.', error: string = 'DADOS_INVALIDOS') {
    super(message, 400, error);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autenticado.', error: string = 'NAO_AUTENTICADO') {
    super(message, 401, error);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado.', error: string = 'ACESSO_NEGADO') {
    super(message, 403, error);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflito de dados.', error: string = 'CONFLITO') {
    super(message, 409, error);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado.', error: string = 'RECURSO_NAO_ENCONTRADO') {
    super(message, 404, error);
  }
}
