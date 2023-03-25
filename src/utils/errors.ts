export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message)
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message)
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message)
  }
}

export class ForbiddenError extends HttpError {
  status: number

  constructor(message: string) {
    super(403, message)
  }
}
