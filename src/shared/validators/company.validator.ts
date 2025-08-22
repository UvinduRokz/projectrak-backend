import { ValidatorConstraint, registerDecorator } from "class-validator";
import type {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";
import { Container } from "typedi";
import { CompanyRepository } from "@/shared/repositories/company.repository.js";

@ValidatorConstraint({ async: true })
export class IsCompanyNameUniqueConstraint
  implements ValidatorConstraintInterface
{
  async validate(name: string, _args: ValidationArguments) {
    const companyRepo = Container.get(CompanyRepository);
    const company = await companyRepo.findOneByName(name);
    return !company;
  }

  defaultMessage(_args: ValidationArguments) {
    return "Company name is already taken.";
  }
}

export function IsCompanyNameUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions ?? {},
      constraints: [],
      validator: IsCompanyNameUniqueConstraint,
    });
  };
}
