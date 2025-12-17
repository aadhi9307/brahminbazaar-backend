import mysql from "mysql2/promise";

export default async function handler(req, res) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await connection.execute("SELECT 1");
    await connection.end();

    res.status(200).json({ db: "connected" });
  } catch (error) {
    res.status(500).json({
      db: "error",
      message: error.message,
    });
  }
}