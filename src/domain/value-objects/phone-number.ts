export class PhoneNumber {
  constructor(
    public readonly number: string,
    public readonly countryCode: string,
  ) {
    if (!this.isValidPhoneNumber(number)) {
      throw new Error('Invalid phone number format');
    }
    if (!this.isValidCountryCode(countryCode)) {
      throw new Error('Invalid country code format');
    }
  }

  getFullNumber(): string {
    return `${this.countryCode}${this.number}`;
  }

  equals(other: PhoneNumber): boolean {
    return this.number === other.number && this.countryCode === other.countryCode;
  }

  private isValidPhoneNumber(number: string): boolean {
    // Basic validation - contains only digits and common phone characters
    return /^[\d\s\-\(\)\+]+$/.test(number) && number.replace(/\D/g, '').length >= 7;
  }

  private isValidCountryCode(code: string): boolean {
    // Basic validation - starts with + and has 1-4 digits
    return /^\+\d{1,4}$/.test(code);
  }
}
