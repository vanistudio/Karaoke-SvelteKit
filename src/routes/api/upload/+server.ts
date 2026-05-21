import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { json, type RequestHandler } from '@sveltejs/kit';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TO_EXTENSION: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/webp': 'webp',
	'image/gif': 'gif'
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user || !['admin', 'manager'].includes(locals.user.role)) {
		return json({ success: false, message: 'Forbidden' }, { status: 403 });
	}

	try {
		const data = await request.formData();
		const file = data.get('file');

		if (!file || !(file instanceof File)) {
			return json({ success: false, message: 'No file uploaded.' }, { status: 400 });
		}
		if (file.size <= 0) {
			return json({ success: false, message: 'Empty files are not allowed.' }, { status: 400 });
		}
		if (file.size > MAX_UPLOAD_SIZE) {
			return json(
				{ success: false, message: 'File is too large. Maximum size is 5MB.' },
				{ status: 400 }
			);
		}

		const extension = ALLOWED_MIME_TO_EXTENSION[file.type];
		if (!extension) {
			return json(
				{ success: false, message: 'Unsupported file type. Allowed: PNG, JPG, WEBP, GIF.' },
				{ status: 400 }
			);
		}

		const uploadDir = join(process.cwd(), 'static', 'uploads');
		await mkdir(uploadDir, { recursive: true });

		const fileName = `${randomUUID()}.${extension}`;
		const filePath = join(uploadDir, fileName);
		const arrayBuffer = await file.arrayBuffer();

		await writeFile(filePath, Buffer.from(arrayBuffer));

		return json({
			success: true,
			url: `/uploads/${fileName}`
		});
	} catch (error: any) {
		console.error('Upload Error:', error);
		return json({ success: false, message: error?.message || 'Upload failed.' }, { status: 500 });
	}
};
