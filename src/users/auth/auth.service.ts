import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // generate jwt token if when user logs in
  async generateJWT(payload: any, expiresIn: any): Promise<string> {
    try {
      return await this.jwtService.signAsync(payload, {
        expiresIn: expiresIn,
        issuer: 'menuplus.com',
      });
    } catch (error) {
      throw error;
    }
  }
}
