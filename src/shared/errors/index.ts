export class UnauthorizedError extends Error {
  public status = 401;
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends Error {
  public status = 400;
  constructor(message: string = "Bad Request") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error {
  public status = 404;
  constructor(message: string = "Not Found") {
    super(message);
    this.name = "NotFoundError";
  }
}
