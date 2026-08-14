import { Injectable } from '@nestjs/common';

import { PrismaService } from '../database/prisma/prisma.service';

export interface PublicClass {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  instructor: { id: string; name: string };
}

export interface PublicInstructor {
  id: string;
  name: string;
  classes: { id: string; name: string; schedule: string | null }[];
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  /** Turmas para exibição pública (nome do instrutor incluído). */
  async listClasses(): Promise<PublicClass[]> {
    const classes = await this.prisma.class.findMany({
      include: {
        instructor: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      schedule: c.schedule,
      instructor: { id: c.instructor.id, name: c.instructor.name },
    }));
  }

  /**
   * Diretório de instrutores: usuários que aparecem como `instructorId`
   * em alguma turma. Não expõe e-mail, telefone ou dados pessoais.
   */
  async listInstructors(): Promise<PublicInstructor[]> {
    const instructors = await this.prisma.user.findMany({
      where: { instructorClasses: { some: {} } },
      select: {
        id: true,
        name: true,
        instructorClasses: {
          select: { id: true, name: true, schedule: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    return instructors.map((i) => ({
      id: i.id,
      name: i.name,
      classes: i.instructorClasses.map((c) => ({
        id: c.id,
        name: c.name,
        schedule: c.schedule,
      })),
    }));
  }
}
