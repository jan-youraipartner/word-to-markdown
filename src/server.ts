import express from 'express';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import convert, {
  UnsupportedFileError,
  validateFileExtension,
} from './main.js';
import helmet from 'helmet';
import morgan from 'morgan';
import { Request } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Escapes HTML meta-characters to prevent XSS in error messages
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: os.tmpdir() });
app.use(morgan('combined'));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
  }),
);

// Serve static files from dist directory
const distPath = path.join(__dirname, '..', 'dist');
console.log(`Serving static files from: ${distPath}`);
console.log(`Current __dirname: ${__dirname}`);
app.use(express.static(distPath));

// Serve the main HTML file
app.get('/', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath);
});

app.post(
  '/raw',
  upload.single('doc'),
  async (req: Request & { file: multer.File }, res) => {
    if (
      !req.file ||
      typeof req.file !== 'object' ||
      !req.file.path ||
      !req.file.originalname
    ) {
      res.status(400).send('You must upload a document to convert.');
      return;
    }

    // Check if the original filename has .doc extension
    if (req.file.originalname) {
      try {
        validateFileExtension(req.file.originalname);
      } catch (error) {
        if (error instanceof UnsupportedFileError) {
          res.status(400).send(escapeHtml(error.message));
          return;
        }
        throw error;
      }
    }

    try {
      const md = await convert(req.file.path);
      res.status(200).type('text/plain').send(md);
      return;
    } catch (error) {
      if (error instanceof UnsupportedFileError) {
        res.status(400).send(escapeHtml(error.message));
        return;
      }
      throw error;
    }
  },
);

app.get('/_healthcheck', (_req, res) => {
  res.status(200).send('OK');
  return;
});

// 404 handler - must be last
app.use((_req, res) => {
  console.log(`404 - Path not found: ${_req.path}`);
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
