import { getConnection } from './db.js'; // adjust path if needed

export default async function handler(req, res) {
  let conn;

  try {
    conn = await getConnection();

    const { action } = req.query; // e.g., /api/conn?action=GETBUILD

    if (req.method === 'GET') {
      if (action === 'GETBUILD') {
        const [rows] = await conn.execute('SELECT * FROM BUILDINGS');
        res.status(200).json(rows);
      } else if (action === 'GETREVS') {
        const [rows] = await conn.execute('SELECT * FROM REVIEWS');
        res.status(200).json(rows);
      } else {
        res.status(400).json({ error: 'Unknown action' });
      }
    } 
    else if (req.method === 'POST') {
      if (action === 'UPDATEBUILD') {
        const { code, name, address, func, rating, fire, acc, lat, lng } = req.body;
        await conn.execute(
          'UPDATE BUILDINGS SET NAME = ?, ADDRESS = ?, FUNC = ?, RATING = ?, FIRE_DATA = ?, ACCESSIBILITY = ?, LAT = ?, LNG = ? WHERE CODE = ?',
          [name, address, func, rating, fire, acc, lat, lng, code]
        );
        res.status(200).json({ message: 'Building updated' });
      } else if (action === 'POSTBUILD') {
        const { name, address, func, rating, fire, acc, lat, lng } = req.body;
        const [result] = await conn.execute(
          'INSERT INTO BUILDINGS (NAME, ADDRESS, FUNC, RATING, FIRE_DATA, ACCESSIBILITY, LAT, LNG) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [name, address, func, rating, fire, acc, lat, lng]
        );
        res.status(201).json({ message: 'Building added', id: result.insertId });
      } else if (action === 'POSTREV') {
        const { code, rating, comment } = req.body;
        if (!rating) return res.status(400).json({ error: 'Cannot submit review' });
        const [result] = await conn.execute(
          'INSERT INTO REVIEWS (BUILDING_CODE, RATING, COMMENT) VALUES (?, ?, ?)',
          [code, rating, comment]
        );
        res.status(201).json({ message: 'Review added', id: result.insertId });
      } else {
        res.status(400).json({ error: 'Unknown action' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  } finally {
    if (conn) await conn.end();
  }
}