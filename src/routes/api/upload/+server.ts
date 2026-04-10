import { json } from '@sveltejs/kit';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
	try {
		const data = await request.formData();
		const file = data.get('file');

		if (!file || !(file instanceof File)) {
			return json({ success: false, message: 'No file uploaded.' }, { status: 400 });
		}

		// Ensure static/uploads exists
		const uploadDir = join(process.cwd(), 'static', 'uploads');
		if (!existsSync(uploadDir)) {
			mkdirSync(uploadDir, { recursive: true });
		}

		// Generate random filename
		const ext = file.name.split('.').pop();
		const fileName = `${randomUUID()}.${ext}`;
		const filePath = join(uploadDir, fileName);

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		writeFileSync(filePath, buffer);

		return json({
			success: true,
			url: `/uploads/${fileName}`
		});
	} catch (error: any) {
		console.error('Upload Error:', error);
		return json({ success: false, message: error.message }, { status: 500 });
	}
}
