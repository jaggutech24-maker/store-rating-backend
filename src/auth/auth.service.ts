import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      token: this.jwtService.sign(payload),
    };
  }

  async register(payload: any) {
    const { name, email, address, password } = payload;

    // Check if email already in use
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepository.create({
      name,
      email,
      address,
      password: hashedPassword,
      role: 'user', // Registering is always normal user
    });

    const savedUser = await this.userRepository.save(user);
    return this.login(savedUser);
  }

  async updatePassword(userId: number, currentPass: string, newPass: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(currentPass, user.password || '');
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await this.hashPassword(newPass);
    await this.userRepository.save(user);

    return { success: true };
  }
}
