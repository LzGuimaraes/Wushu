import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';

import { StudentProfilesController } from './student-profiles.controller';
import { MedicalRecordsController } from './medical-records.controller';
import { StudentProfilesService } from '../services/student-profiles.service';
import { MedicalRecordsService } from '../services/medical-records.service';
import { StudentProfileEntity } from '../entities/student-profile.entity';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

describe('StudentProfilesController (IDOR protection)', () => {
  let controller: StudentProfilesController;

  const ownerId = 'user-owner';
  const otherId = 'user-other';

  const profile: StudentProfileEntity = Object.assign(
    new StudentProfileEntity(),
    { id: 'profile-1', userId: ownerId },
  );

  const serviceMock = {
    findOne: jest.fn().mockResolvedValue(profile),
    update: jest.fn().mockResolvedValue(profile),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentProfilesController],
      providers: [
        { provide: StudentProfilesService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<StudentProfilesController>(
      StudentProfilesController,
    );
  });

  const dto = { phone: '(99) 99999-9999' };

  it('bloqueia um usuário comum tentando editar o perfil de OUTRO usuário pelo ID', async () => {
    const attacker: AuthenticatedUser = {
      userId: otherId,
      email: 'attacker@example.com',
      role: 'STUDENT',
    };

    await expect(
      controller.update('profile-1', attacker, dto as never),
    ).rejects.toThrow(ForbiddenException);

    expect(serviceMock.update).not.toHaveBeenCalled();
  });

  it('permite que o dono edite o próprio perfil', async () => {
    const owner: AuthenticatedUser = {
      userId: ownerId,
      email: 'owner@example.com',
      role: 'STUDENT',
    };

    const result = await controller.update('profile-1', owner, dto as never);
    expect(serviceMock.update).toHaveBeenCalledWith('profile-1', dto);
    expect(result).toEqual(profile);
  });

  it('permite que um ADMIN edite o perfil de qualquer aluno', async () => {
    const admin: AuthenticatedUser = {
      userId: 'admin-1',
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    const result = await controller.update('profile-1', admin, dto as never);
    expect(serviceMock.update).toHaveBeenCalledWith('profile-1', dto);
    expect(result).toEqual(profile);
  });
});

describe('MedicalRecordsController (student self-service)', () => {
  it('permite que o aluno envie a sua própria ficha médica após a aprovação', async () => {
    const serviceMock = {
      upsert: jest.fn().mockResolvedValue({ id: 'record-1' }),
      findByStudentProfileId: jest.fn().mockResolvedValue({ id: 'record-1' }),
    };

    const studentProfilesService = {
      findByUserId: jest.fn().mockResolvedValue({ id: 'profile-1' }),
    };

    const controller = new MedicalRecordsController(
      serviceMock as never,
      studentProfilesService as never,
    );

    const user: AuthenticatedUser = {
      userId: 'student-1',
      email: 'student@example.com',
      role: 'STUDENT',
    };

    await controller.upsertMy(user, {
      hasDisease: true,
      diseaseDescription: 'Asma leve',
    });

    expect(studentProfilesService.findByUserId).toHaveBeenCalledWith('student-1');
    expect(serviceMock.upsert).toHaveBeenCalledWith('profile-1', {
      hasDisease: true,
      diseaseDescription: 'Asma leve',
    });
  });
});
