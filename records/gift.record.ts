import { ValidationError } from "../utils/errors";
import { pool } from "../utils/db";
import { v4 as uuid } from "uuid";
import { FieldPacket } from "mysql2";

type GiftRecordResult = [GiftRecord[], FieldPacket[]];

export class GiftRecord {
  public id?: string;
  public name: string;
  public count: number;
  constructor(obj: GiftRecord) {
    if (!obj.name || obj.name.length < 3 || obj.name.length > 55) {
      throw new ValidationError(
        "Gift name must be between 3 and 55 characters"
      );
    }
    if (!obj.count || obj.count < 1 || obj.count > 999999) {
      throw new ValidationError("Number of gifts must be between 1 and 999999");
    }
  }

  async insert(): Promise<string> {
    if (!this.id) {
      this.id = uuid();
    }
    await pool.execute("INSERT INTO `gifts` VALUES(:id, :name, :count)", {
      id: this.id,
      name: this.name,
      count: this.count,
    });
    return this.id;
  }
  static async listAll(): Promise<GiftRecord[]> {
    const [results] = (await pool.execute(
      "SELECT * FROM `gifts`"
    )) as GiftRecordResult;
    return results.map((obj) => new GiftRecord(obj));
  }
  static async getOne(id: string): Promise<GiftRecord | null> {
    const [results] = (await pool.execute(
      "SELECT * FROM `gifts` WHERE `id` = :id",
      {
        id,
      }
    )) as GiftRecordResult;
    return results.length === 0 ? null : new GiftRecord(results[0]);
  }

  async countGivenGifts(): Promise<number> {
    const [[{ count }]] /* answer[0][0].count */ = (await pool.execute(
      "SELECT COUNT(*) AS `count` FROM `children` WHERE `giftId` = :id",
      {
        id: this.id,
      }
    )) as GiftRecordResult;
    return count;
  }
}
