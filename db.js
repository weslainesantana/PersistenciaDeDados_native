import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = "exemploApp.sqlite";

export async function openDBAsync() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Tabela locations pronta");
  return db;
}

export async function runAsync(db, query, params = []) {
  try {
    const result = await db.runAsync(query, params);
    console.log("Query executada com sucesso:", query, params);
    return result;
  } catch (error) {
    console.error("Erro ao executar query:", query, params, error);
    throw error;
  }
}

export async function getAllAsync(db, query, params = []) {
  try {
    const result = await db.getAllAsync(query, params);
    console.log("Query executada com sucesso:", query);
    return result;
  } catch (error) {
    console.error("Erro ao executar query:", query, error);
    throw error;
  }
}