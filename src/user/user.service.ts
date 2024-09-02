import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Método para crear un nuevo usuario
  async create(userData: Partial<User>): Promise<User> {
    // Encriptar la contraseña antes de guardar
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  // Método para obtener todos los usuarios
  async findAll(page: number = 1, limit: number = 10): Promise<{ data: User[]; total: number; }> {
    const [result, total] = await this.userRepository.findAndCount({
      select: ['id', 'name', 'email'],
      take: limit, // Número de resultados por página
      skip: (page - 1) * limit, // Cuántos resultados omitir (para la paginación)
    });
  
    return {
      data: result,
      total,
    };
  }

  // Método para obtener un usuario por ID
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ 
        where: { id },
        select: ['id', 'name', 'email']
      });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return user;
  }

  // Método para actualizar un usuario existente
  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    if (updateData.password) {
      // Encriptar la nueva contraseña si se proporciona
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  // Método para eliminar un usuario por ID
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
