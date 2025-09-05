import { getDb } from "../config/db";

export async function getById(id: number) {
  const db = await getDb();
  const res = await db.query(`SELECT * FROM subscription_plans WHERE id = $1`, [id]);
  return res.rows[0];
}

export async function getByCreemProductId(id: string) {
  const db = await getDb();
  const res = await db.query(`SELECT * FROM subscription_plans WHERE creem_product_id = $1`, [id]);
  return res.rows[0];
}
  