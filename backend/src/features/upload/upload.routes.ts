import { Elysia, t } from 'elysia';
import { storageService } from '@/services/storage.service';
import { authMiddleware } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '@/common/response';

export const uploadRoutes = new Elysia({ prefix: '/upload' })
  .get(
    '/file/*',
    async ({ params, set }) => {
      try {
        const key = (params as Record<string, string>)['*'];
        console.log('[STORAGE PROXY] requested key:', key);
        if (!key) {
          set.status = 404;
          return errorResponse('File key is required');
        }

        const s3Object = await storageService.getFile(key);
        const contentType = s3Object.ContentType || 'application/octet-stream';
        const bytes = await s3Object.Body?.transformToByteArray();

        if (!bytes) {
          set.status = 404;
          return errorResponse('File not found');
        }

        return new Response(Buffer.from(bytes), {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': 'inline',
          },
        });
      } catch (error) {
        set.status = 404;
        return errorResponse('File not found in storage');
      }
    },
    {
      detail: {
        tags: ['Upload'],
        summary: 'Stream / Proxy file from MinIO storage',
        description: 'Streams a file directly from MinIO storage, bypassing client-side SSL and Mixed Content limitations.',
      },
    }
  )
  .use(authMiddleware)
  .post(
    '/',
    async ({ body, set }) => {
      try {
        const file = body.file;
        const folder = body.folder || 'misc';

        if (!file) {
          set.status = 400;
          return errorResponse('No file uploaded');
        }

        // Validate file type (image or PDF)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          set.status = 400;
          return errorResponse('Hanya file gambar (JPEG, PNG, WEBP, GIF, SVG) atau dokumen PDF yang diperbolehkan');
        }

        // Validate file size (max 25MB)
        const maxSize = 25 * 1024 * 1024;
        if (file.size > maxSize) {
          set.status = 400;
          return errorResponse('Ukuran file terlalu besar (maksimal 25MB)');
        }

        const url = await storageService.uploadFile(file, folder);
        
        return successResponse({ url }, 'File uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        set.status = 500;
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
        return errorResponse(`Upload failed: ${errorMessage}`);
      }
    },
    {
      isAuthenticated: true,
      detail: {
        tags: ['Upload'],
        summary: 'Upload a file',
        description: 'Upload a file to storage (MinIO). Supported types: Images (JPEG, PNG, WEBP, GIF) and PDF documents. Max size: 25MB.',
        security: [{ BearerAuth: [] }],
      },
      body: t.Object({
        file: t.File(),
        folder: t.Optional(t.String({ default: 'misc' })),
      }),
      response: {
        200: t.Object({
          success: t.Boolean({ example: true }),
          data: t.Optional(t.Object({
            url: t.String(),
          })),
          message: t.Optional(t.String()),
          error: t.Optional(t.String()),
        }),
        400: t.Object({
          success: t.Boolean({ example: false }),
          error: t.String(),
          message: t.Optional(t.String()),
        }),
      },
    }
  );
