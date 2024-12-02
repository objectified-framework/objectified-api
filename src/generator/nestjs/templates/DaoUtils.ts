/**
 * Database Utilities class
 */

/**
 * This is a utilities class that contains methods for interacting with the database.
 */
export class DaoUtils {
  private static readonly pgp = require('pg-promise')();
  private static readonly db = this.pgp(
      process.env.DATABASE_URL ?? 'postgres://localhost:5432/postgres'
  );

  constructor() { }

  /**
   * Retrieves the database connection.
   *
   * @returns {pgPromise.IDatabase<any>} The database connection.
   */
  public static getDatabase() {
    return this.db;
  }

  /**
   * Normalizes the data from the database, converting it to the `T` type specified.
   *
   * @param data The data to normalize.
   * @returns {T} The normalized data in the shape of T.
   */
  public static normalize<T>(data: any | undefined | null): T {
    const returnObject: any = {};

    if (!data) {
      return data;
    }

    for (const [key, obj] of <[string, any]>Object.entries(data)) {
      const newKey = toCamelCase(key);
      returnObject[newKey] = obj;
    }

    return <T>returnObject;
  }

  /**
   * Generates an insert SQL statement for the specified table and data.
   *
   * @param tableName {string} The name of the table to insert into.
   * @param data {any} The data to insert.
   */
  public static generateInsertSql(tableName: string, data: any): string {
    const keys = Object.keys(data);
    let sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (`;

    sql += keys.map((x) => '$[' + x + ']').join(', ');
    sql += ') RETURNING *';

    return sql;
  }

  /**
   * Generates an update SQL statement for the specified table and data.
   *
   * @param tableName {string} The name of the table to update.
   * @param data {any} The data to update.
   */
  public static generateUpdateSql(tableName: string, data: any): string {
    const keys = Object.keys(data);
    let sql = `UPDATE ${tableName} SET `;

    sql += keys.map((x) => x + '=$[' + x + ']').join(', ');
    sql += ' WHERE id=$[id] RETURNING *';

    return sql;
  }

  /**
   * Generates a select statement for the specified table and where clause.
   *
   * @param tableName {string} The name of the table to select from.
   * @param where {any} The where clause data to search for.
   */
  public static generateSelectSql(tableName: string, where: any): string {
    const keys = Object.keys(where);
    let sql = `SELECT * FROM ${tableName} WHERE `;

    sql += keys.map((x) => x + '=$[' + x + ']').join(' AND ');

    return sql;
  }
}

/**
 * Converts a string to camel case.
 *
 * @param str String to convert.
 */
export function toCamelCase(str: string): string {
  const s =
    str &&
    str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('');

  return s.slice(0, 1).toLowerCase() + s.slice(1);
}
