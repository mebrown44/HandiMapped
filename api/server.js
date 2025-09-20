import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './conn.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML/JS files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// All requests to /api/conn go to your conn.js
app.all('/api/conn', handler);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));