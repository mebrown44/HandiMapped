import express from 'express';
import path from 'path';
import handler from './conn.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static HTML/JS files
app.use(express.static(path.join(process.cwd(), 'public')));

// API endpoint for DB interactions
app.all('/api/conn', handler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});