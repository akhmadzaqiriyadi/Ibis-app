import nodemailer from 'nodemailer';
import { config } from '@/config/env';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailPort === 465,
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });

  async send({ to, subject, html }: SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: `"IBISTEK UTY" <${config.emailUser}>`,
      to,
      subject,
      html,
    });
  }

  // ─── Templates ───────────────────────────────────────

  async sendAccountVerified(to: string, name: string): Promise<void> {
    await this.send({
      to,
      subject: 'Akun IBISTEK UTY Anda Telah Diverifikasi ✅',
      html: `
        <h2>Halo, ${name}!</h2>
        <p>Selamat! Akun IBISTEK UTY Anda telah berhasil diverifikasi oleh Admin.</p>
        <p>Anda sudah bisa masuk dan menggunakan layanan IBISTEK UTY.</p>
        <a href="${config.appUrl}/login" style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Masuk Sekarang</a>
        <br><br>
        <small>IBISTEK UTY — Inkubator Bisnis dan Teknologi Universitas Teknologi Yogyakarta</small>
      `,
    });
  }

  async sendAccountRejected(to: string, name: string, reason?: string): Promise<void> {
    await this.send({
      to,
      subject: 'Verifikasi Akun IBISTEK UTY',
      html: `
        <h2>Halo, ${name}.</h2>
        <p>Mohon maaf, permohonan akun IBISTEK UTY Anda belum dapat kami setujui saat ini.</p>
        ${reason ? `<p><strong>Alasan:</strong> ${reason}</p>` : ''}
        <p>Silakan hubungi admin IBISTEK UTY untuk informasi lebih lanjut.</p>
        <small>IBISTEK UTY — Inkubator Bisnis dan Teknologi Universitas Teknologi Yogyakarta</small>
      `,
    });
  }

  async sendInkubasiApproved(to: string, name: string, periodName: string): Promise<void> {
    await this.send({
      to,
      subject: 'Selamat! Pengajuan Inkubasi Bisnis Anda Diterima 🎉',
      html: `
        <h2>Halo, ${name}!</h2>
        <p>Selamat! Pengajuan program inkubasi bisnis Anda untuk <strong>${periodName}</strong> telah <strong>diterima</strong>.</p>
        <p>Undangan untuk mengikuti program akan kami kirimkan melalui email ini. Harap pantau kotak masuk Anda.</p>
        <a href="${config.appUrl}/dashboard/inkubasi" style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Lihat Status</a>
        <br><br>
        <small>IBISTEK UTY — Inkubator Bisnis dan Teknologi Universitas Teknologi Yogyakarta</small>
      `,
    });
  }

  async sendInkubasiRejected(to: string, name: string, periodName: string, note?: string): Promise<void> {
    await this.send({
      to,
      subject: 'Informasi Pengajuan Inkubasi Bisnis IBISTEK UTY',
      html: `
        <h2>Halo, ${name}.</h2>
        <p>Terima kasih telah mendaftar program inkubasi bisnis IBISTEK UTY untuk <strong>${periodName}</strong>.</p>
        <p>Setelah melalui proses seleksi, pengajuan Anda <strong>belum dapat kami terima</strong> pada periode ini.</p>
        ${note ? `<p><strong>Catatan:</strong> ${note}</p>` : ''}
        <p>Anda masih dapat mendaftar kembali pada periode berikutnya.</p>
        <small>IBISTEK UTY — Inkubator Bisnis dan Teknologi Universitas Teknologi Yogyakarta</small>
      `,
    });
  }

  async sendKonsultasiAssigned(to: string, name: string, mentorName: string, deadline: Date): Promise<void> {
    await this.send({
      to,
      subject: 'Pengajuan Konsultasi Sedang Diproses 🕐',
      html: `
        <h2>Halo, ${name}!</h2>
        <p>Pengajuan konsultasi bisnis Anda sedang dalam proses konfirmasi. Mentor yang ditugaskan adalah <strong>${mentorName}</strong>.</p>
        <p>Kami akan mengirimkan konfirmasi jadwal konsultasi sebelum <strong>${deadline.toLocaleDateString('id-ID', { dateStyle: 'long' })}</strong>.</p>
        <a href="${config.appUrl}/dashboard/konsultasi" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Lihat Status</a>
        <br><br>
        <small>IBISTEK UTY — Inkubator Bisnis dan Teknologi Universitas Teknologi Yogyakarta</small>
      `,
    });
  }

  async sendKonsultasiConfirmed(
    to: string,
    name: string,
    mentorName: string,
    confirmedDate: Date,
    metode: string,
    meetingLink?: string,
    meetingLocation?: string
  ): Promise<void> {
    const metodeInfo = metode === 'ONLINE'
      ? `<p>📹 <strong>Metode:</strong> Online via Zoom/GMeet<br/><a href="${meetingLink}">🔗 ${meetingLink}</a></p>`
      : `<p>📍 <strong>Metode:</strong> Offline<br/>Lokasi: ${meetingLocation}</p>`;

    await this.send({
      to,
      subject: 'Jadwal Konsultasi Bisnis Anda Telah Dikonfirmasi ✅',
      html: `
        <h2>Halo, ${name}!</h2>
        <p>Konsultasi bisnis Anda telah <strong>dikonfirmasi</strong>.</p>
        <p>📅 <strong>Tanggal:</strong> ${confirmedDate.toLocaleDateString('id-ID', { dateStyle: 'long' })}, pukul ${confirmedDate.toLocaleTimeString('id-ID', { timeStyle: 'short' })} WIB</p>
        <p>👨‍🏫 <strong>Mentor:</strong> ${mentorName}</p>
        ${metodeInfo}
        <p>Harap hadir tepat waktu. Jika ada kendala, silakan hubungi kami segera.</p>
        <small>IBISTEK UTY — Inkubator Bisnis dan Teknologi Universitas Teknologi Yogyakarta</small>
      `,
    });
  }

  async sendKonsultasiCancelled(to: string, name: string, reason?: string): Promise<void> {
    await this.send({
      to,
      subject: 'Informasi Pembatalan Konsultasi IBISTEK UTY',
      html: `
        <h2>Halo, ${name}.</h2>
        <p>Mohon maaf, jadwal konsultasi bisnis Anda <strong>dibatalkan</strong>.</p>
        ${reason ? `<p><strong>Alasan:</strong> ${reason}</p>` : ''}
        <p>Anda dapat mengajukan konsultasi kembali melalui dashboard.</p>
        <a href="${config.appUrl}/dashboard/konsultasi" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Ajukan Ulang</a>
        <br><br>
        <small>IBISTEK UTY — Inkubator Bisnis dan Teknologi Universitas Teknologi Yogyakarta</small>
      `,
    });
  }
}

export const emailService = new EmailService();
