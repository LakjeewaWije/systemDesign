import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import parsePhoneNumber from 'libphonenumber-js';

@ValidatorConstraint({ name: 'isValidMobileNumber', async: false })
export class IsValidMobileNumber implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    try {
      const sanitizedValue = value.replace(/\s/g, '');
      const phoneNumber = parsePhoneNumber(sanitizedValue);
      if (!phoneNumber) {
        return false;
      }
      console.log(
        'mobile number',
        phoneNumber.country,
        phoneNumber.isPossible(),
        phoneNumber.isValid(),
      );
      return phoneNumber.isPossible();
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid mobile number`;
  }
}
