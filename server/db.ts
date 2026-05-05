import { eq, and, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, douPublicacoes, InsertDOUPublicacao, searchCache, InsertSearchCache } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function saveDOUPublicacao(publicacao: InsertDOUPublicacao): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save DOU publicacao: database not available");
    return;
  }

  try {
    await db.insert(douPublicacoes).values(publicacao).onDuplicateKeyUpdate({
      set: { dataCriacao: new Date() },
    });
  } catch (error) {
    console.error("[Database] Failed to save DOU publicacao:", error);
    throw error;
  }
}

export async function getUnsentPublicacoes() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get unsent publicacoes: database not available");
    return [];
  }

  try {
    return await db.select().from(douPublicacoes).where(
      isNull(douPublicacoes.dataEmailEnviado)
    );
  } catch (error) {
    console.error("[Database] Failed to get unsent publicacoes:", error);
    return [];
  }
}

export async function markPublicacaoAsEmailSent(publicacaoId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark publicacao as sent: database not available");
    return;
  }

  try {
    await db.update(douPublicacoes)
      .set({ dataEmailEnviado: new Date() })
      .where(eq(douPublicacoes.id, publicacaoId));
  } catch (error) {
    console.error("[Database] Failed to mark publicacao as sent:", error);
    throw error;
  }
}


// Cache functions
export async function getCachedResults(date: string, searchType: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get cached results: database not available");
    return null;
  }

  try {
    const result = await db.select().from(searchCache)
      .where(and(
        eq(searchCache.date, date),
        eq(searchCache.searchType, searchType)
      ))
      .limit(1);

    if (result.length > 0) {
      return JSON.parse(result[0].results);
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to get cached results:", error);
    return null;
  }
}

export async function saveCachedResults(date: string, searchType: string, results: unknown): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save cached results: database not available");
    return;
  }

  try {
    const cache: InsertSearchCache = {
      date,
      searchType,
      results: JSON.stringify(results),
    };

    await db.insert(searchCache).values(cache).onDuplicateKeyUpdate({
      set: { results: JSON.stringify(results), updatedAt: new Date() },
    });
  } catch (error) {
    console.error("[Database] Failed to save cached results:", error);
    throw error;
  }
}
