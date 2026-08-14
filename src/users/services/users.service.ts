import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: CreateUserDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.usersRepository.create({ ...data, password: hashedPassword });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity | null> {
    return this.usersRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.remove(id);
  }

  async markEmailVerified(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.markEmailVerified(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
}
