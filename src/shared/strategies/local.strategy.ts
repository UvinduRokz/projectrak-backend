import passportLocal from "passport-local";
import { Container } from "typedi";

import { AuthService } from "@/modules/auth/service/auth.service.js";
import { UnauthorizedError } from "../errors/index.js";

const LocalStrategy = passportLocal.Strategy;
export const localStrategy = new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: false,
  },
  async (username: string, password: string, done) => {
    try {
      const authService = Container.get(AuthService);
      const user = await authService.validateUser(username, password);
      return done(null, user);
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        return done(null, false, { message: err.message });
      }
      return done(err);
    }
  }
);
