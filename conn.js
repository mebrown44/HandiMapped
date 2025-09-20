import { getConnection } from './db.js'; // adjust path if needed

export default async function handler(req, res) {
  let conn;

  try {
    conn = await getConnection();

    if (req.method === 'GET') {
      // SELECT all rows from a table (e.g., users)
      const [rows] = await conn.execute('SELECT * FROM users');
      res.status(200).json(rows);
    } 
    else if (req.method === 'POST') {
      // Expect JSON body with values to insert
      const { name, email } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: 'Missing name or email' });
        return;
      }

      const [result] = await conn.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
      );

      res.status(201).json({ message: 'User added', id: result.insertId });
    } 
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  } finally {
    if (conn) await conn.end();
  }
}