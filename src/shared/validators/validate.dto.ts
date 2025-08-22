import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import type { NextFunction, Request, Response } from "express";

export function validationPipe<D extends object>(
  DtoClass: new () => D,
  { isArray = false } = {}
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(DtoClass, req.body, {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      });

      if (isArray) {
        if (!Array.isArray(req.body)) {
          throw new Error("Expected array payload");
        }
        await Promise.all(
          (dto as D[]).map((item) =>
            validateOrReject(item, {
              whitelist: true,
              forbidNonWhitelisted: true,
            })
          )
        );
      } else {
        await validateOrReject(dto, {
          whitelist: true,
          forbidNonWhitelisted: true,
        });
      }

      req.body = dto;
      next();
    } catch (errors) {
      console.error("Validation failed:", JSON.stringify(errors, null, 2));
      next(errors);
    }
  };
}
