import { env } from '$env/dynamic/private';
import { Resend } from 'resend';
import { settingService } from './setting.service';

interface EmailOptions {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
}

interface VerificationEmailOptions {
	email: string;
	name?: string | null;
	verificationUrl: string;
}

export class EmailService {
	private client: Resend | null = null;

	private async getSystemInfo() {
		const map = await settingService.getSettingsMap([
			'site_name',
			'site_phone',
			'site_address',
			'site_email'
		]);

		return {
			siteName: map.site_name?.trim() || 'KaraSystem',
			hotline: map.site_phone?.trim() || '',
			address: map.site_address?.trim() || '',
			contactEmail: map.site_email?.trim() || ''
		};
	}

	private getClient() {
		const apiKey = env.RESEND_API_KEY?.trim();
		if (!apiKey) {
			throw new Error('RESEND_API_KEY is not set');
		}

		if (!this.client || this.client.key !== apiKey) {
			this.client = new Resend(apiKey);
		}

		return this.client;
	}

	private getSender() {
		const fromEmail = env.RESEND_FROM_EMAIL?.trim();
		if (!fromEmail) {
			throw new Error('RESEND_FROM_EMAIL is not set');
		}

		const fromName = env.RESEND_FROM_NAME?.trim() || 'KaraSystem';
		const replyTo = env.RESEND_REPLY_TO?.trim() || undefined;

		return {
			from: `${fromName} <${fromEmail}>`,
			replyTo
		};
	}

	async send(options: EmailOptions) {
		const client = this.getClient();
		const sender = this.getSender();

		const result = await client.emails.send({
			from: sender.from,
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text,
			replyTo: sender.replyTo
		});

		if (result.error) {
			throw new Error(result.error.message);
		}

		return result.data;
	}

	async sendEmailVerification({ email, name, verificationUrl }: VerificationEmailOptions) {
		const greeting = name?.trim() ? `Xin chào ${name.trim()},` : 'Xin chào,';
		const system = await this.getSystemInfo();

		const contactLines = [system.hotline && `Hotline: ${system.hotline}`, system.address, system.contactEmail]
			.filter(Boolean)
			.join(' • ');

		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
				<div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
					<p style="margin: 0 0 12px; font-size: 14px; color: #4b5563;">${greeting}</p>
					<h1 style="margin: 0 0 16px; font-size: 24px; line-height: 1.3;">Xác thực email tài khoản ${system.siteName}</h1>
					<p style="margin: 0 0 16px; font-size: 14px; line-height: 1.7; color: #4b5563;">
						Bạn vừa đăng ký hoặc yêu cầu gửi lại email xác thực. Nhấn nút bên dưới để xác nhận địa chỉ email của bạn.
					</p>
					<div style="margin: 24px 0;">
						<a
							href="${verificationUrl}"
							style="display: inline-block; padding: 12px 20px; border-radius: 10px; background: #0f766e; color: #ffffff; text-decoration: none; font-weight: 700;"
						>
							Xác thực email
						</a>
					</div>
					<p style="margin: 0 0 8px; font-size: 13px; line-height: 1.7; color: #6b7280;">
						Nếu nút không hoạt động, hãy mở liên kết này trong trình duyệt:
					</p>
					<p style="margin: 0 0 16px; font-size: 13px; line-height: 1.7; word-break: break-all;">
						<a href="${verificationUrl}" style="color: #0f766e;">${verificationUrl}</a>
					</p>
					<p style="margin: 0; font-size: 12px; line-height: 1.7; color: #9ca3af;">
						Liên kết này có thời hạn sử dụng theo cấu hình bảo mật của hệ thống.
					</p>
					${
						contactLines
							? `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e5e7eb; font-size: 12px; line-height: 1.7; color: #6b7280;">
						<p style="margin: 0; font-weight: 700;">Thông tin hệ thống</p>
						<p style="margin: 4px 0 0;">${contactLines}</p>
					</div>`
							: ''
					}
				</div>
			</div>
		`;

		const text = [
			greeting,
			'',
			'Xác thực email tài khoản KaraSystem',
			'',
			'Bạn vừa đăng ký hoặc yêu cầu gửi lại email xác thực.',
			`Mở liên kết sau để xác nhận email: ${verificationUrl}`,
			'',
			'Liên kết này có thời hạn sử dụng theo cấu hình bảo mật của hệ thống.',
			contactLines ? '' : null,
			contactLines ? `Thông tin hệ thống: ${contactLines}` : null
		]
			.filter(Boolean)
			.join('\n');

		return await this.send({
			to: email,
			subject: `Xác thực email tài khoản ${system.siteName}`,
			html,
			text
		});
	}

	async sendBookingConfirmed(
		email: string,
		data: { bookingId: number; roomName: string; startTime: Date; endTime: Date; totalCost: number }
	) {
		const system = await this.getSystemInfo();
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
		const contactLines = [system.hotline && `Hotline: ${system.hotline}`, system.address, system.contactEmail]
			.filter(Boolean)
			.join(' • ');

		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 20px;">${system.siteName}</h1>
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
					${
						contactLines
							? `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e5e7eb; font-size: 12px; line-height: 1.7; color: #6b7280;">
						<p style="margin: 0; font-weight: 700;">Thông tin hệ thống</p>
						<p style="margin: 4px 0 0;">${contactLines}</p>
					</div>`
							: ''
					}
				</div>
			</div>
		`;

		const text = [
			`Xác nhận đặt phòng #${data.bookingId}`,
			`Phòng: ${data.roomName}`,
			`Bắt đầu: ${fmtTime(data.startTime)}`,
			`Kết thúc: ${fmtTime(data.endTime)}`,
			`Tổng tiền: ${fmtVND(data.totalCost)}`,
			contactLines ? '' : null,
			contactLines ? `Thông tin hệ thống: ${contactLines}` : null
		]
			.filter(Boolean)
			.join('\n');

		return await this.send({
			to: email,
			subject: `Xác nhận đặt phòng #${data.bookingId} - ${system.siteName}`,
			html,
			text
		});
	}

	async sendBookingCancelled(
		email: string,
		data: { bookingId: number; roomName: string; reason?: string }
	) {
		const system = await this.getSystemInfo();
		const contactLines = [system.hotline && `Hotline: ${system.hotline}`, system.address, system.contactEmail]
			.filter(Boolean)
			.join(' • ');

		const html = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<div style="background: #ef4444; padding: 24px; border-radius: 12px 12px 0 0;">
					<h1 style="color: white; margin: 0; font-size: 20px;">${system.siteName}</h1>
					<p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px;">Thông báo hủy đặt phòng</p>
				</div>
				<div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
					<h2 style="margin: 0 0 16px; font-size: 16px; color: #111;">Đơn #${data.bookingId} đã bị hủy</h2>
					<p style="font-size: 14px; color: #6b7280;">Phòng: <strong>${data.roomName}</strong></p>
					${data.reason ? `<p style="font-size: 14px; color: #6b7280;">Lý do: ${data.reason}</p>` : ''}
					<p style="margin: 20px 0 0; font-size: 13px; color: #9ca3af;">Nếu bạn đã thanh toán, tiền sẽ được hoàn trong 3-5 ngày làm việc.</p>
					${
						contactLines
							? `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e5e7eb; font-size: 12px; line-height: 1.7; color: #6b7280;">
						<p style="margin: 0; font-weight: 700;">Thông tin hệ thống</p>
						<p style="margin: 4px 0 0;">${contactLines}</p>
					</div>`
							: ''
					}
				</div>
			</div>
		`;

		const text = [
			`Thông báo hủy đặt phòng #${data.bookingId}`,
			`Phòng: ${data.roomName}`,
			data.reason ? `Lý do: ${data.reason}` : '',
			'Nếu bạn đã thanh toán, tiền sẽ được hoàn trong 3-5 ngày làm việc.',
			contactLines ? '' : null,
			contactLines ? `Thông tin hệ thống: ${contactLines}` : null
		]
			.filter(Boolean)
			.join('\n');

		return await this.send({
			to: email,
			subject: `Hủy đặt phòng #${data.bookingId} - ${system.siteName}`,
			html,
			text
		});
	}
}

export const emailService = new EmailService();
