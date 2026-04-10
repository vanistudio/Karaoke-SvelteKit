import { router, protectedProcedure } from '$lib/server/trpc/t';
import { loyaltyService } from '$lib/server/services/loyalty.service';
import { db } from '$lib/server/db';
import { pointHistory } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const loyaltyRouter = router({
	getInfo: protectedProcedure.query(async ({ ctx }) => {
		return await loyaltyService.getLoyaltyInfo(ctx.user.id);
	}),
	getHistory: protectedProcedure.query(async ({ ctx }) => {
		return await db.select()
			.from(pointHistory)
			.where(eq(pointHistory.userId, ctx.user.id))
			.orderBy(desc(pointHistory.createdAt));
	})
});
