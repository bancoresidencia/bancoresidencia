declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string, options?: { readOnly?: boolean; enableForeignKeyConstraints?: boolean });
    close(): void;
    prepare(sql: string): StatementSync;
    exec(sql: string): void;
  }

  export class StatementSync {
    all(...params: unknown[]): Record<string, unknown>[];
    get(...params: unknown[]): Record<string, unknown> | undefined;
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  }
}

