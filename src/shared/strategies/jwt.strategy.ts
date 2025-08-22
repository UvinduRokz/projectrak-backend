import passportJwt from "passport-jwt";
import { config } from "@/config/config.module.js";
import { UnauthorizedError } from "../errors/index.js";

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

export const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret,
  },
  (payload, done) => {
    if (!payload?.sub || !payload?.type) {
      return done(new UnauthorizedError("invalid_token"), false);
    }

    const user = {
      userId: payload.sub,
      type: payload.type,
      companyId: payload.companyId,
      username: payload.username,
      email: payload.email,
    };

    return done(null, user);
  }
);
