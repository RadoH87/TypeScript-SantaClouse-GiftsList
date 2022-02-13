const { pool } = require("../utils/db");
const { ValidationError } = require("../utils/errors");
const { v4: uuid } = require("uuid");

class GiftRecord {
  constructor(obj) {
    if (!obj.name || obj.name.length < 3 || obj.name.length > 55) {
      throw new ValidationError(
        "Gift name must be between 3 and 55 characters"
      );
    }

    if (!obj.count || obj.count < 1 || obj.count > 999999) {
      throw new ValidationError("Number of gifts must be between 1 and 999999");
    }

    this.id = obj.id;
    this.name = obj.name;
    this.count = obj.count;
  }

  async insert() {
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

  static async listAll() {
    const [results] = await pool.execute("SELECT * FROM `gifts`");
    return results.map((obj) => new GiftRecord(obj));
  }

  static async getOne(id) {
    const [results] = await pool.execute(
      "SELECT * FROM `gifts` WHERE `id` = :id",
      {
        id,
      }
    );
    return results.length === 0 ? null : new GiftRecord(results[0]);
  }

  async countGivenGifts() {
    const [[{ count }]] /* answer[0][0].count */ = await pool.execute(
      "SELECT COUNT(*) AS `count` FROM `children` WHERE `giftId` = :id",
      {
        id: this.id,
      }
    );
    return count;
  }
}

module.exports = {
  GiftRecord,
};
