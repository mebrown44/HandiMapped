import { getPool } from '../db.js';

export default async function handler(req, res) {
  try {
    const pool = getPool();
    const { action } = req.query;

    if (req.method === 'GET') {
      if (action === 'GETBUILD') {
        const [rows] = await pool.query('SELECT * FROM BUILDINGS');
        return res.status(200).json(rows);
      } else if (action === 'GETREVS') {
        const [rows] = await pool.query('SELECT * FROM REVIEWS');
        return res.status(200).json(rows);
      } else {
        return res.status(400).json({ error: 'Unknown action' });
      }
    }

    if (req.method === 'POST') {
      if (action === 'UPDATEBUILD') {
        const { code, name, address, func, rating, fire, acc, lat, lng } = req.body;
        await pool.query(
          'UPDATE BUILDINGS SET NAME = ?, ADDRESS = ?, FUNC = ?, RATING = ?, FIRE_DATA = ?, ACCESSIBILITY = ?, LAT = ?, LNG = ? WHERE CODE = ?',
          [name, address, func, rating, fire, acc, lat, lng, code]
        );
        return res.status(200).json({ message: 'Building updated' });
      }

      if (action === 'POSTBUILD') {
        const { name, address, func, rating, fire, acc, lat, lng } = req.body;
        const [result] = await pool.query(
          'INSERT INTO BUILDINGS (NAME, ADDRESS, FUNC, RATING, FIRE_DATA, ACCESSIBILITY, LAT, LNG) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [name, address, func, rating, fire, acc, lat, lng]
        );
        return res.status(201).json({ message: 'Building added', id: result.insertId });
      }

      if (action === 'POSTREV') {
        const { building, rating, comment, name } = req.body;
        if (!rating) return res.status(400).json({ error: 'Cannot submit review' });
        const [result] = await pool.query(
          'INSERT INTO REVIEWS (BUILDING_CODE, RATING, COMMENT, NAME) VALUES ((SELECT CODE FROM BUILDINGS WHERE NAME= ?), ?, ?, ?)',
          [building, rating, comment, name]
        );
        return res.status(201).json({ message: 'Review added', id: result.insertId });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
}