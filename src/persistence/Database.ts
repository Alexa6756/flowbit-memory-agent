import sqlite3 from "sqlite3";
import path from "path";

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(
      path.join(process.cwd(), "demo.db")
    );
    this.initialize();
  }

  private initialize() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS memory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT,
          key TEXT,
          value TEXT,
          confidence REAL,
          successCount INTEGER DEFAULT 0,
          totalApplied INTEGER DEFAULT 0,
          lastUpdated TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS invoice_fingerprints (
          vendor TEXT,
          invoice_number TEXT,
          invoice_date TEXT,
          total_amount REAL,
          PRIMARY KEY (vendor, invoice_number)
        )
      `);
    });
  }

  insert(
    type: string,
    key: string,
    value: string,
    confidence: number
  ) {
    this.db.run(
      `INSERT INTO memory VALUES (NULL, ?, ?, ?, ?, 0, 0, ?)`,
      [type, key, value, confidence, new Date().toISOString()]
    );
  }

  async fetch(type: string, key: string): Promise<any[]> {
    return new Promise(resolve => {
      this.db.all(
        `SELECT * FROM memory WHERE type=? AND key=?`,
        [type, key],
        (_, rows) => resolve(rows || [])
      );
    });
  }

  updateStats(
    id: number,
    confidence: number,
    success: boolean
  ) {
    this.db.run(
      `
      UPDATE memory
      SET confidence=?,
          successCount = successCount + ?,
          totalApplied = totalApplied + 1,
          lastUpdated=?
      WHERE id=?
      `,
      [
        confidence,
        success ? 1 : 0,
        new Date().toISOString(),
        id
      ]
    );
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise(resolve => {
      this.db.all(sql, params, (_, rows) => resolve(rows || []));
    });
  }

  async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise(resolve => {
      this.db.run(sql, params, () => resolve());
    });
  }
}
