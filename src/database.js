import fs from "node:fs/promises";

const dbPath = new URL("../db.json", import.meta.url);

export default class Database {
  #database = {};

  constructor() {
    this.#init();
  }

  async #init() {
    try {
      const data = await fs.readFile(dbPath);
      this.#database = JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        await this.#save();
      } else {
        console.error(err);
      }
    }
  }

  async #save() {
    await fs.writeFile(dbPath, JSON.stringify(this.#database));
  }

  getById(table, id) {
    const data = this.#database[table] ?? [];
    return data.find((row) => row.id === id);
  }

  select(table, filter) {
    let data = this.#database[table] ?? [];

    if (filter) {
      data = data.filter((row) =>
        Object.entries(filter).some(([key, value]) => row[key].includes(value))
      );
    }

    return data;
  }

  async insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }
    await this.#save();
  }

  async update(table, id, data) {
    if (Array.isArray(this.#database[table])) {
      const rowIndex = this.#database[table].findIndex(
        (data) => data.id === id
      );
      if (rowIndex > -1) {
        this.#database[table][rowIndex] = { id, ...data };
        await this.#save();
      }
    }
  }

  async delete(table, id) {
    if (Array.isArray(this.#database[table])) {
      const rowIndex = this.#database[table].findIndex(
        (data) => data.id === id
      );
      if (rowIndex > -1) {
        this.#database[table].splice(rowIndex, 1);
        await this.#save();
      }
    }
  }
}
