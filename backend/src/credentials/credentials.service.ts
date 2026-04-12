import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { userModelCredentials } from '../database/schema';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { encrypt, decrypt } from './crypto.util';

@Injectable()
export class CredentialsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(userId: string) {
    const rows = await this.db
      .select()
      .from(userModelCredentials)
      .where(eq(userModelCredentials.userId, userId));

    return rows.map((row) => this.toResponse(row));
  }

  async create(userId: string, dto: CreateCredentialDto) {
    const id = this.generateId('cred');
    const encryptedApiKey = encrypt(dto.apiKey);

    const [created] = await this.db
      .insert(userModelCredentials)
      .values({
        id,
        userId,
        provider: dto.provider,
        label: dto.label,
        encryptedApiKey,
      })
      .returning();

    return this.toResponse(created);
  }

  async update(userId: string, credentialId: string, dto: UpdateCredentialDto) {
    await this.assertOwnership(userId, credentialId);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (dto.label !== undefined) updateData.label = dto.label;
    if (dto.apiKey !== undefined) updateData.encryptedApiKey = encrypt(dto.apiKey);
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive ? 1 : 0;

    const [updated] = await this.db
      .update(userModelCredentials)
      .set(updateData)
      .where(eq(userModelCredentials.id, credentialId))
      .returning();

    return this.toResponse(updated);
  }

  async remove(userId: string, credentialId: string) {
    await this.assertOwnership(userId, credentialId);

    await this.db
      .delete(userModelCredentials)
      .where(eq(userModelCredentials.id, credentialId));
  }

  private toResponse(row: typeof userModelCredentials.$inferSelect) {
    return {
      id: row.id,
      provider: row.provider,
      label: row.label,
      maskedKey: this.maskKey(row.encryptedApiKey),
      isActive: row.isActive === 1,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private maskKey(encryptedKey: string): string {
    const plaintext = decrypt(encryptedKey);
    if (plaintext.length <= 11) {
      return '****';
    }
    return plaintext.slice(0, 7) + '****' + plaintext.slice(-4);
  }

  private async assertOwnership(userId: string, credentialId: string) {
    const [row] = await this.db
      .select()
      .from(userModelCredentials)
      .where(
        and(
          eq(userModelCredentials.id, credentialId),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundException('Credential not found');
    }

    if (row.userId !== userId) {
      throw new ForbiddenException('You do not own this credential');
    }
  }

  private generateId(prefix: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = `${prefix}_`;
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
