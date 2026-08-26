const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Point directly to backend project paths inside WSL
const dbPath = path.resolve('/home/nani/hrprtl/hr_database.db');
const uploadsDir = path.resolve('/home/nani/hrprtl/uploads');

// Helper function to run async SQL queries with sqlite3
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Helper function to safely clean DB tables
async function cleanDatabase() {
  if (!fs.existsSync(dbPath)) return;

  const db = new sqlite3.Database(dbPath);
  try {
    await runQuery(db, 'DELETE FROM documents');
    await runQuery(db, 'DELETE FROM sqlite_sequence WHERE name = "documents"');
  } catch (err) {
    // Safely ignore if table/sequence does not exist
  } finally {
    db.close();
  }
}

test.describe("API testing via file uploads", () => {

  // Hook: Clean BEFORE each test
  test.beforeEach(async () => {
    await cleanDatabase();
  });

  // Hook: Clean AFTER all tests complete
  test.afterAll(async () => {
    // 1. Clear database rows
    await cleanDatabase();

    // 2. Clear uploaded files on disk
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    }
  });

  const testFiles = [
    { name: 'sample_resume.pdf', mimeType: 'application/pdf', content: '%PDF-1.4 dummy pdf' },
    { name: 'employee_photo.jpeg', mimeType: 'image/jpeg', content: 'dummy jpeg image binary' },
    { name: 'employee_photo.jpeg', mimeType: 'image/jpeg', content: 'dummy jpeg image binary' },
    { name: 'notes.txt', mimeType: 'text/plain', content: 'plain text notes' }
  ];

  for (const [index, file] of testFiles.entries()) {
    test(`Upload ${file.name} (${file.mimeType}) via API (${index + 1})`, async ({ request }) => {
      const filePath = path.join(__dirname, `../fixtures/${file.name}`);

      const fixtureDir = path.dirname(filePath);
      if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir, { recursive: true });
      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, file.content);

      const response = await request.post('http://localhost:3000/api/upload', {
        multipart: {
          file: {
            name: file.name,
            mimeType: file.mimeType,
            buffer: fs.readFileSync(filePath)
          }
        }
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.message).toBe('File uploaded successfully');
      expect(body.documentId).toBeTruthy();
    });
  }
});
