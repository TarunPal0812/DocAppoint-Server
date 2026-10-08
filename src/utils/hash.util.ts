import bcrypt from 'bcrypt';

export class HashUtil {
  static async hash(data: string, saltRounds = 10): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(data, salt);
  }

  static async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
