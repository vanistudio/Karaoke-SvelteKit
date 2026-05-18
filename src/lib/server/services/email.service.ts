import { settingService } from './setting.service';

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

export class EmailService {
	private async getConfig() {
		try {
			return await settingService.getSettingsMap([
				'email_smtp_host',
				'email_smtp_port',
				'email_smtp_user',
				'email_smtp_pass',
				'email_from_name'
			]);
		} catch {
			return {};
		}
	}

	async send(options: EmailOptions) {
		const config = await this.getConfig();
		console.log('═══════════════════════════════════════════');
		console.log('📧 EMAIL NOTIFICATION (Mock Mode)');
		console.log('═══════════════════════════════════════════');
		console.log(`To: ${options.to}`);
		console.log(`Subject: ${options.subject}`);
		console.log(`From: ${config['email_from_name'] || 'KaraSystem'}`);
		console.log('───────────────────────────────────────────');
		console.log(
			options.html
				.replace(/<[^>]*>/g, '')
				.trim()
				.slice(0, 200)
		);
		console.log('═══════════════════════════════════════════');

		return true;
	}

	async sendBookingConfirmed(
		email: string,
		data: { bookingId: number; roomName: string; startTime: Date; endTime: Date; totalCost: number }
	) {
		const fmtTime = (d: Date) =>
			new Intl.DateTimeFormat('vi-VN', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}).format(d);
		const fmtVND = (v: number) =>
			new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

		const html = `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 20px;">🎤 KaraSystem</h1>
					<p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px;">Xác nhận đặt phòng thành công</p>
				</div>
				<div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
					<h2 style="margin: 0 0 16px; font-size: 16px; color: #111;">Đơn đặt phòng #${data.bookingId}</h2>
					<table style="width: 100%; font-size: 14px; border-collapse: collapse;">
						<tr><td style="padding: 8px 0; color: #6b7280;">Phòng:</td><td style="padding: 8px 0; font-weight: bold;">${data.roomName}</td></tr>
						<tr><td style="padding: 8px 0; color: #6b7280;">Bắt đầu:</td><td style="padding: 8px 0;">${fmtTime(data.startTime)}</td></tr>
						<tr><td style="padding: 8px 0; color: #6b7280;">Kết thúc:</td><td style="padding: 8px 0;">${fmtTime(data.endTime)}</td></tr>
						<tr><td style="padding: 8px 0; color: #6b7280;">Tổng tiền:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">${fmtVND(data.totalCost)}</td></tr>
					</table>
					<p style="margin: 20px 0 0; font-size: 13px; color: #9ca3af;">Vui lòng đến đúng giờ. Liên hệ hotline nếu cần hỗ trợ.</p>
				</div>
			</div>
		`;

		return await this.send({
			to: email,
			subject: `✅ Xác nhận đặt phòng #${data.bookingId} — KaraSystem`,
			html
		});
	}

	async sendBookingCancelled(
		email: string,
		data: { bookingId: number; roomName: string; reason?: string }
	) {
		const html = `
			<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background: #ef4444; padding: 24px; border-radius: 12px 12px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 20px;">🎤 KaraSystem</h1>
					<p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px;">Thông báo hủy đặt phòng</p>
				</div>
				<div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
					<h2 style="margin: 0 0 16px; font-size: 16px; color: #111;">Đơn #${data.bookingId} đã bị hủy</h2>
					<p style="font-size: 14px; color: #6b7280;">Phòng: <strong>${data.roomName}</strong></p>
					${data.reason ? `<p style="font-size: 14px; color: #6b7280;">Lý do: ${data.reason}</p>` : ''}
					<p style="margin: 20px 0 0; font-size: 13px; color: #9ca3af;">Nếu bạn đã thanh toán, tiền sẽ được hoàn trong 3-5 ngày làm việc.</p>
				</div>
			</div>
		`;

		return await this.send({
			to: email,
			subject: `❌ Hủy đặt phòng #${data.bookingId} — KaraSystem`,
			html
		});
	}
}

export const emailService = new EmailService();
