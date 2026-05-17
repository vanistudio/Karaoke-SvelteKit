import { router, adminProcedure, publicProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { settingService } from '$lib/server/services/setting.service';

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
		.mutation(async ({ input }) => {
			return await settingService.updateSettings(input);
		}),
	getPublic: publicProcedure.query(async () => {
		const keys = [
			'site_name', 'site_slogan', 'site_phone',
			'site_address', 'site_email', 'site_open_time', 'site_close_time'
		];
		return await settingService.getSettingsMap(keys);
	})
});
