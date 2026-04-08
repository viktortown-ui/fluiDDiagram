/**
 * App/service data store for non-project data (recent files, telemetry metadata, settings).
 * Project data is intentionally stored as git-friendly files under .fdproj folders.
 */
export interface SqlExecutor {
  execute(sql: string, params?: ReadonlyArray<unknown>): unknown;
}

export class AppDataSqlite {
  public constructor(private readonly executor: SqlExecutor) {}

  public initialize(): void {
    this.executor.execute(`
      CREATE TABLE IF NOT EXISTS recent_projects (
        id TEXT PRIMARY KEY,
        path TEXT NOT NULL,
        opened_at TEXT NOT NULL
      )
    `);
  }

  public addRecentProject(projectId: string, path: string, openedAtIso: string): void {
    this.executor.execute(
      `
      INSERT INTO recent_projects (id, path, opened_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
      path = excluded.path,
      opened_at = excluded.opened_at
    `,
      [projectId, path, openedAtIso]
    );
  }
}
