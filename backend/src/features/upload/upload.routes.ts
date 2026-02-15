import { Elysia, t } from 'elysia';
import { storageService } from '@/services/storage.service';
import { authMiddleware } from '../auth/auth.middleware';
import { successResponse, errorResponse } from '@/common/response';

export const uploadRoutes = new Elysia({ prefix: '/upload' })
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

        // Validate file type (basic)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          set.status = 400;
          return errorResponse('Only image files (JPEG, PNG, WEBP, GIF) are allowed');
        }

        // Validate file size (e.g., 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          set.status = 400;
          return errorResponse('File size too large (max 5MB)');
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
        description: 'Upload a file to storage (MinIO). Supported types: Images (JPEG, PNG, WEBP, GIF). Max size: 5MB.',
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
