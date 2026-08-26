cat server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Initialize SQLite Database
const db = new sqlite3.Database('./hr_database.db', (err) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to SQLite Database.");
});

// Setup Database Schema & Seed Initial Data
db.serialize(() => {
  // Employees Table
  db.run(`CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      department TEXT,
      role TEXT,
      salary REAL
  )`);

  // Documents Table for File Uploads
  db.run(`CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Reset and seed data
  db.run(`DELETE FROM employees`);
  const stmt = db.prepare(`INSERT INTO employees (name, department, role, salary) VALUES (?, ?, ?, ?)`);
  stmt.run("Alice Smith", "Engineering", "Senior DevOps Engineer", 95000);
  stmt.run("Bob Jones", "HR", "Talent Acquisition Specialist", 65000);
  stmt.run("Charlie Brown", "Finance", "Financial Analyst", 75000);
  stmt.finalize();
});

// --- REST API ENDPOINTS ---

// API: Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.status(200).json({ success: true, token: 'hr-session-token-9988', message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// API: Get Employees
app.get('/api/employees', (req, res) => {
  db.all(`SELECT * FROM employees`, [], (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// API: Add Employee
app.post('/api/employees', (req, res) => {
  const { name, department, role, salary } = req.body;
  if (!name || !department || !role || !salary) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const stmt = db.prepare(`INSERT INTO employees (name, department, role, salary) VALUES (?, ?, ?, ?)`);
  stmt.run(name, department, role, salary, function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.status(201).json({ id: this.lastID, name, department, role, salary });
  });
  stmt.finalize();
});

// API: Delete Employee
app.delete('/api/employees/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM employees WHERE id = ?`, [id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.status(200).json({ message: `Employee ${id} deleted successfully` });
  });
});

// API: Export Payroll CSV (Download endpoint)
app.get('/api/export/payroll', (req, res) => {
  const csvContent = "ID,Name,Department,Salary\n1,Alice Smith,Engineering,95000\n2,Bob Jones,HR,65000\n3,Charlie Brown,Finance,75000";
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="payroll_report.csv"');
  res.status(200).send(csvContent);
});

// Redirect root path '/' to '/login.html'
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// API Endpoint for File Uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { filename, path: filepath, mimetype } = req.file;

  const query = `INSERT INTO documents (filename, filepath, mimetype) VALUES (?, ?, ?)`;
  db.run(query, [filename, filepath, mimetype], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to insert document metadata' });
    }
    res.status(201).json({
      message: 'File uploaded successfully',
      documentId: this.lastID,
      filename: filename
    });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`HR Portal Server running on http://localhost:${PORT}`);
});
