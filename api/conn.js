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
        const { code, name, address, func, fire, acc } = req.body;
        const coords = await geocoderAPI(address);
        if (!coords) {
          return res.status(400).json({ error: "Could not geocode address" });
        }
        const { lat, lng } = coords;

        await pool.query(
          'UPDATE BUILDINGS SET NAME = ?, ADDRESS = ?, FUNC = ?, RATING = (SELECT IFNULL(AVG(RATING), 0) FROM REVIEWS WHERE BUILDING_CODE = ?), FIRE_DATA = ?, ACCESSIBILITY = ?, LAT = ?, LNG = ? WHERE CODE = ?',
          [name, address, func, code, fire, acc, lat, lng, code]
        );
        return res.status(200).json({ message: 'Building updated' });
      }

      if (action === 'POSTBUILD') {
        const { name, address, func, fire, acc } = req.body;
        const coords = await geocoderAPI(address);
        if (!coords) {
          return res.status(400).json({ error: "Could not geocode address" });
        }
        const { lat, lng } = coords;

        const [result] = await pool.query(
          'INSERT INTO BUILDINGS (NAME, ADDRESS, FUNC, RATING, FIRE_DATA, ACCESSIBILITY, LAT, LNG) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [name, address, func, null, fire, acc, lat, lng]
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
        //Updates building rating
        const [update] =await pool.query(
          'UPDATE BUILDINGS b JOIN (SELECT BUILDING_CODE, IFNULL(AVG(RATING), 0) AS avg_rating FROM REVIEWS GROUP BY BUILDING_CODE) r ON b.CODE = r.BUILDING_CODE SET b.RATING = r.avg_rating WHERE b.NAME = ?',
          [building]
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

async function geocoderAPI(address){
  var href=encodeURIComponent(address);

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${href}&apiKey=bc2fd3091eff4ed0ba0fa289231e4f3c`
    );
    const result = await response.json();

    if (result.features && result.features.length > 0) {
      const [lng, lat] = result.features[0].geometry.coordinates;
      return { lat, lng };
    } else {
      throw new Error("No results found");
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}