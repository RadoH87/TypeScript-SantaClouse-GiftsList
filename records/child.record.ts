import { pool } from "../utils/db";
import { ValidationError } from "../utils/errors";
import { v4 as uuid } from "uuid";
import { FieldPacket } from "mysql2";

type ChildRecordResult = [ChildRecord[], FieldPacket[]];

export class ChildRecord {
  public id?: string;
  public name: string;
  public giftId: string;
  constructor(obj: ChildRecord) {
    if (!obj.name || obj.name.length < 3 || obj.name.length > 25) {
      throw new ValidationError("Name must be at least 25 characters");
    }
  }

  async insert(): Promise<string> {
    if (!this.id) {
      this.id = uuid();
    }
    await pool.execute(
      "INSERT INTO `children`(`id`, `name`) VALUES(:id, :name)",
      {
        id: this.id,
        name: this.name,
      }
    );
    return this.id;
  }

  static async listAll(): Promise<ChildRecord[]> {
    const [results] = (await pool.execute(
      "SELECT * FROM `children` ORDER BY `name` ASC"
    )) as ChildRecordResult;
    return results.map((obj) => new ChildRecord(obj));
  }

  static async getOne(id: string): Promise<ChildRecord | null> {
    const [results] = (await pool.execute(
      "SELECT * FROM `children` WHERE `id` = :id",
      {
        id,
      }
    )) as ChildRecordResult;
    return results.length === 0 ? null : new ChildRecord(results[0]);
  }

  async update(): Promise<void> {
    await pool.execute(
      "UPDATE `children` SET `name` = :name, `giftId` = :giftId WHERE `id` = :id",
      {
        id: this.id,
        name: this.name,
        giftId: this.giftId,
      }
    );
  }
}
