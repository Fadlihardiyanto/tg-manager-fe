import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat Layanan',
  robots: {
    index: false
  }
};

export default function TermsOfServicePage() {
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8'>
        {/* Main Heading */}
        <div className='text-center'>
          <h1 className='text-foreground text-3xl font-bold'>Syarat Layanan</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Terakhir diperbarui:{' '}
            {new Date().toLocaleDateString('id-ID', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Introduction */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Pendahuluan</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Selamat datang di aplikasi kami. Syarat Layanan ini mengatur akses dan penggunaan
            platform kami. Dengan mengakses atau menggunakan aplikasi ini, Anda setuju untuk
            mematuhi ketentuan ini. Silakan baca dengan saksama sebelum melanjutkan penggunaan
            layanan kami.
          </p>
        </section>

        {/* Demo Purpose */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Tujuan Demo</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Aplikasi ini disediakan semata-mata untuk tujuan demonstrasi dan edukasi. Aplikasi ini
            tidak dimaksudkan untuk penggunaan produksi, dan kami tidak memberikan jaminan apa pun
            terkait kesesuaiannya untuk tujuan tertentu. Seluruh data dan fungsi disediakan apa
            adanya untuk menampilkan fitur dan kemampuan saja.
          </p>
        </section>

        {/* Open Source */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Proyek Open Source</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Ini adalah proyek open source. Kode sumber tersedia untuk ditinjau, dimodifikasi, dan
            didistribusikan di bawah lisensi open source yang berlaku. Kami mendorong kontribusi dan
            masukan dari komunitas untuk membantu meningkatkan proyek ini. Silakan lihat repositori
            proyek untuk detail lisensi dan panduan kontribusi.
          </p>
        </section>

        {/* No Warranty */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Tanpa Jaminan</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Aplikasi ini disediakan &ldquo;apa adanya&rdquo; tanpa jaminan apa pun, baik yang
            tersurat maupun tersirat. Kami secara tegas menolak seluruh jaminan, termasuk namun
            tidak terbatas pada jaminan kelayakan jual, kesesuaian untuk tujuan tertentu, dan
            non-pelanggaran. Kami tidak menjamin bahwa aplikasi akan berjalan tanpa gangguan, tepat
            waktu, aman, atau bebas kesalahan.
          </p>
        </section>

        {/* Data Usage */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Penggunaan Data</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Data apa pun yang Anda berikan saat menggunakan aplikasi demo ini dapat disimpan
            sementara untuk tujuan menunjukkan fungsinya. Kami tidak menjamin keamanan atau privasi
            dari data apa pun yang dimasukkan ke dalam aplikasi demo ini. Mohon jangan memasukkan
            informasi sensitif, pribadi, atau rahasia. Data dapat dihapus atau direset kapan saja
            tanpa pemberitahuan.
          </p>
        </section>

        {/* Changes */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>
            Perubahan pada Ketentuan Ini
          </h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Kami berhak mengubah atau mengganti Syarat Layanan ini kapan saja atas kebijakan kami
            sendiri. Merupakan tanggung jawab Anda untuk meninjau ketentuan ini secara berkala.
            Penggunaan aplikasi yang terus berlanjut setelah perubahan dipublikasikan dianggap
            sebagai persetujuan Anda atas perubahan tersebut.
          </p>
        </section>

        {/* Contact */}
        <section className='border-border border-t pt-4'>
          <p className='text-muted-foreground text-center text-sm'>
            Jika Anda memiliki pertanyaan tentang Syarat Layanan ini, silakan lihat dokumentasi
            proyek atau repositori untuk informasi lebih lanjut.
          </p>
        </section>
      </div>
    </div>
  );
}
