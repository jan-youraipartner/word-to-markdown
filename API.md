# Word to Markdown API Documentation

## Overview
Convert Word documents (.docx) to Markdown format via a REST API.

## Base URL
- Production: `https://word-to-markdown-production.up.railway.app`
- Local: `http://localhost:3000`

## Endpoints

### POST /api/convert

Convert a Word document to Markdown format.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body Parameters:
  - `file` (required): The Word document file (.docx)

**Response Format:**

Success (200 OK):
```json
{
  "success": true,
  "markdown": "# Heading\n\nParagraph text",
  "originalFilename": "document.docx",
  "size": 12345
}
```

Error (400 Bad Request):
```json
{
  "success": false,
  "error": "Invalid file type",
  "message": "Only .docx files are supported"
}
```

Error (500 Internal Server Error):
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred during conversion."
}
```

## Examples

### cURL
```bash
curl -X POST https://word-to-markdown-production.up.railway.app/api/convert \
  -F "file=@document.docx" \
  -H "Accept: application/json"
```

### n8n HTTP Request Node
1. Add an HTTP Request node
2. Configure:
   - Method: `POST`
   - URL: `https://word-to-markdown-production.up.railway.app/api/convert`
   - Body Content Type: `Form-Data`
   - Specify Body: `Using Fields Below`
   - Body Parameters:
     - Name: `file`
     - Type: `n8n Binary File`
     - Input Data Field Name: (your binary file field name)

3. The response will contain the markdown in the `markdown` field

### JavaScript (fetch)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://word-to-markdown-production.up.railway.app/api/convert', {
  method: 'POST',
  body: formData,
  headers: {
    'Accept': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  console.log('Markdown:', result.markdown);
} else {
  console.error('Error:', result.message);
}
```

### Python (requests)
```python
import requests

with open('document.docx', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'https://word-to-markdown-production.up.railway.app/api/convert',
        files=files,
        headers={'Accept': 'application/json'}
    )

result = response.json()
if result['success']:
    print(result['markdown'])
else:
    print(f"Error: {result['message']}")
```

## Legacy Endpoint

### POST /raw

Returns plain text markdown (legacy support).

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body Parameters:
  - `doc` (required): The Word document file (.docx)

**Response:**
- Content-Type: `text/plain`
- Body: Raw markdown text

## Supported File Types
- Microsoft Word (.docx) - Office 2007 and later
- Google Docs (export as .docx first)

## Limitations
- Maximum file size: Determined by server configuration
- Only .docx format is supported (not .doc)
- Complex formatting may not convert perfectly

## Health Check

### GET /_healthcheck

Check if the service is running.

**Response:**
- Status: 200 OK
- Body: `OK`
