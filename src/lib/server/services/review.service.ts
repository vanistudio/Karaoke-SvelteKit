import { db } from '$lib/server/db';
import { review, user, room } from '$lib/server/db/schema';
import { eq, sql, count, avg } from 'drizzle-orm';

export class ReviewService {
	async create(data: { userId: string; bookingId: number; roomId: number; rating: number; comment?: string }) {
		if (data.rating < 1 || data.rating > 5) throw new Error('Rating phải từ 1 đến 5');

		const existing = await db.select().from(review).where(eq(review.bookingId, data.bookingId)).then(res => res[0]);
		if (existing) throw new Error('Bạn đã đánh giá đơn này rồi');

		return await db.insert(review).values({
			userId: data.userId,
			bookingId: data.bookingId,
			roomId: data.roomId,
			rating: data.rating,
			comment: data.comment ?? null
		}).returning().then(res => res[0]);
	}

	async getByRoom(roomId: number) {
		return await db
			.select({
				id: review.id,
				rating: review.rating,
				comment: review.comment,
				createdAt: review.createdAt,
				userName: user.name
			})
			.from(review)
			.leftJoin(user, eq(review.userId, user.id))
			.where(eq(review.roomId, roomId))
			.orderBy(sql`${review.createdAt} DESC`)
			.limit(20);
	}

	async getRoomStats(roomId: number) {
		const result = await db
			.select({
				avgRating: avg(review.rating),
				totalReviews: count()
			})
			.from(review)
			.where(eq(review.roomId, roomId));

		return {
			avgRating: result[0]?.avgRating ? Number(Number(result[0].avgRating).toFixed(1)) : 0,
			totalReviews: result[0]?.totalReviews || 0
		};
	}

	async getAllRoomStats() {
		const results = await db
			.select({
				roomId: review.roomId,
				avgRating: avg(review.rating),
				totalReviews: count()
			})
			.from(review)
			.groupBy(review.roomId);

		return results.map(r => ({
			roomId: r.roomId,
			avgRating: r.avgRating ? Number(Number(r.avgRating).toFixed(1)) : 0,
			totalReviews: r.totalReviews
		}));
	}

	async getAll(params: { page?: number; limit?: number } = {}) {
		const { page = 1, limit = 20 } = params;
		const offset = (page - 1) * limit;

		const data = await db
			.select({
				id: review.id,
				rating: review.rating,
				comment: review.comment,
				createdAt: review.createdAt,
				userName: user.name,
				userEmail: user.email,
				roomName: room.name,
				roomId: review.roomId,
				bookingId: review.bookingId
			})
			.from(review)
			.leftJoin(user, eq(review.userId, user.id))
			.leftJoin(room, eq(review.roomId, room.id))
			.orderBy(sql`${review.createdAt} DESC`)
			.limit(limit)
			.offset(offset);

		const total = await db.select({ count: count() }).from(review).then(res => res[0].count);

		return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
	}

	async getOverallStats() {
		const result = await db
			.select({
				avgRating: avg(review.rating),
				totalReviews: count()
			})
			.from(review);

		return {
			avgRating: result[0]?.avgRating ? Number(Number(result[0].avgRating).toFixed(1)) : 0,
			totalReviews: result[0]?.totalReviews || 0
		};
	}
}

export const reviewService = new ReviewService();
