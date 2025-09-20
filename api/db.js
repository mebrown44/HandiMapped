//import mysql from 'mysql2/promise';

//export async function getConnection() {
  //return await mysql.createConnection({
    //host: process.env.DB_HOST,
    //port: process.env.DB_PORT,
    //user: process.env.DB_USER,
    //password: process.env.DB_PASS,
    //database: process.env.DB_NAME,
  //});
//}

import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}