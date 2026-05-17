import { router, adminProcedure, publicProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { settingService } from '$lib/server/services/setting.service';
import { activityService } from '$lib/server/services/activity.service';

export const settingRouter = router({
	list: adminProcedure.query(async () => {
		return await settingService.getAllSettings();
	}),
	getByGroup: adminProcedure
		.input(z.string())
		.query(async ({ input }) => {
			return await settingService.getSettingsByGroup(input);
		}),
	update: adminProcedure
		.input(
			z.array(
				z.object({
					key: z.string(),
					value: z.string(),
					group: z.string()
				})
			)
		)
		.mutation(async ({ ctx, input }) => {
			const result = await settingService.updateSettings(input);
			const groups = Array.from(new Set(input.map(entry => entry.group))).join(', ');
			await activityService.log(
				ctx.user.id,
				'update',
				'setting',
				undefined,
				`Cập nhật ${input.length} cấu hình${groups ? ` (${groups})` : ''}`
			);
			return result;
		}),
	getPublic: publicProcedure.query(async () => {
		const keys = [
			'site_name', 'site_slogan', 'site_phone',
			'site_address', 'site_email', 'site_open_time', 'site_close_time'
		];
		return await settingService.getSettingsMap(keys);
	})
});
