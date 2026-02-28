## 12. File Uploads & Binary Data

### Choosing the right upload method

| File size | Method | When to use |
|-----------|--------|-------------|
| < 1 MB | Base64 in JSON body | Only when tight JSON integration is critical (e.g., inline images in a message payload). Increases payload by 33%. |
| 1–100 MB | Multipart form data | Standard approach. File and metadata in a single request. |
| 1–100 MB | Presigned URL | Offload upload traffic to cloud storage (S3, GCS). API never handles the bytes. |
| > 100 MB | Resumable / chunked upload | Survives network interruptions. Client resumes from the last successful chunk. |

### Multipart form data

The most common approach. Sends the file and metadata in a single request:

```
POST /documents
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="file"; filename="report.pdf"
Content-Type: application/pdf

<binary data>
------FormBoundary
Content-Disposition: form-data; name="title"

Q1 Sales Report
------FormBoundary--

HTTP/1.1 201 Created
Location: /documents/doc_abc123

{
  "id": "doc_abc123",
  "filename": "report.pdf",
  "size": 2048576,
  "contentType": "application/pdf",
  "url": "/documents/doc_abc123/content"
}
```

### Presigned URLs (recommended for cloud-native architectures)

A two-step pattern where the API issues a temporary, scoped upload URL and the client
uploads directly to cloud storage:

```
# Step 1: Request an upload URL from your API
POST /documents/upload-url
Content-Type: application/json

{ "filename": "report.pdf", "contentType": "application/pdf", "size": 2048576 }

HTTP/1.1 200 OK

{
  "uploadUrl": "https://s3.amazonaws.com/bucket/tmp/abc?X-Amz-Signature=...",
  "expiresAt": "2026-02-28T14:38:01Z",
  "documentId": "doc_abc123"
}
```

```
# Step 2: Client uploads directly to cloud storage
PUT https://s3.amazonaws.com/bucket/tmp/abc?X-Amz-Signature=...
Content-Type: application/pdf

<binary data>

HTTP/1.1 200 OK
```

**Why presigned URLs:** Your API server never handles the raw bytes. Upload traffic
goes directly to cloud storage, which is purpose-built for throughput and reliability.
This dramatically reduces API server load and latency.

### Resumable uploads

For large files over unreliable networks, use chunked uploads where interruptions
only require re-uploading the last incomplete chunk:

```
# Step 1: Initiate the upload
POST /uploads
Content-Type: application/json

{ "filename": "video.mp4", "totalSize": 524288000 }

HTTP/1.1 201 Created
Location: /uploads/upl_xyz789

# Step 2: Upload chunks
PATCH /uploads/upl_xyz789
Content-Type: application/offset+octet-stream
Upload-Offset: 0
Content-Length: 5242880

<first 5MB of binary data>

HTTP/1.1 204 No Content
Upload-Offset: 5242880

# Step 3: Resume after interruption
HEAD /uploads/upl_xyz789

HTTP/1.1 200 OK
Upload-Offset: 5242880   ← server confirms how much it received

PATCH /uploads/upl_xyz789
Upload-Offset: 5242880
...
```

The **tus protocol** is an open standard for resumable uploads with growing adoption.
An IETF draft (draft-ietf-httpbis-resumable-upload) is also formalizing this pattern.

### Security and validation

| Practice | Rationale |
|----------|-----------|
| Validate file type by magic bytes, not just `Content-Type` | Clients can spoof the Content-Type header |
| Generate random UUIDs for stored filenames | Prevents path traversal attacks and filename collisions |
| Set presigned URL expiry to 15–60 minutes | Minimizes the window for URL leakage |
| Enforce file size limits server-side | Return `413 Content Too Large` if exceeded |
| Store uploads outside the webroot | Prevents direct execution of uploaded files |
| Scan for malware before making files accessible | Critical for user-generated content |

### Downloads

Serve files with appropriate headers:

```
GET /documents/doc_abc123/content

HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="report.pdf"
Content-Length: 2048576
Cache-Control: private, max-age=3600
```

For large files, support range requests (`Accept-Ranges: bytes`) to enable partial
downloads and resumable downloads.

---

