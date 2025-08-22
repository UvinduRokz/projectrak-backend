import passport from "passport";
import type { Request, Response, NextFunction } from "express";

export function protect(allowedTypes?: string | string[]) {
  const types = Array.isArray(allowedTypes)
    ? allowedTypes
    : allowedTypes
    ? [allowedTypes]
    : undefined;

  return (req: Request, res: Response, next: NextFunction) => {
    return passport.authenticate(
      "jwt",
      { session: false },
      (err: Error, user: any, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Unauthorized" });
        }

        if (types && !types.includes(user.type)) {
          return res.status(403).json({ message: "forbidden" });
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  };
}
