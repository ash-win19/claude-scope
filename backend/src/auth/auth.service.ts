import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { users, userSettings } from '../database/schema';

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findOrCreateUser(
    auth0Sub: string,
    profile?: { name?: string; email?: string; avatarUrl?: string },
  ) {
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, auth0Sub))
      .limit(1);

    if (existing) {
      const updates: Record<string, unknown> = {};
      if (profile?.name && profile.name !== existing.name)
        updates.name = profile.name;
      if (profile?.email && profile.email !== existing.email)
        updates.email = profile.email;
      if (profile?.avatarUrl && profile.avatarUrl !== existing.avatarUrl)
        updates.avatarUrl = profile.avatarUrl;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        const [updated] = await this.db
          .update(users)
          .set(updates)
          .where(eq(users.id, auth0Sub))
          .returning();
        return {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          avatarUrl: updated.avatarUrl,
        };
      }

      return {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        avatarUrl: existing.avatarUrl,
      };
    }

    const [user] = await this.db
      .insert(users)
      .values({
        id: auth0Sub,
        name: profile?.name || profile?.email?.split('@')[0] || 'User',
        email: profile?.email ?? '',
        avatarUrl: profile?.avatarUrl ?? null,
        passwordHash: '',
      })
      .returning();

    await this.db.insert(userSettings).values({ userId: auth0Sub });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }

  async updateProfile(
    auth0Sub: string,
    data: { name?: string; email?: string; avatarUrl?: string },
  ) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    const [updated] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, auth0Sub))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
      });

    return updated;
  }
}
