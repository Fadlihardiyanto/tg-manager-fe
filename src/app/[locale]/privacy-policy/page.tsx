import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  robots: {
    index: false
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8'>
        {/* Main Heading */}
        <h1 className='text-foreground text-3xl font-bold'>Kebijakan Privasi</h1>

        {/* Introduction */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Pendahuluan</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Kebijakan Privasi ini menjelaskan bagaimana kami menangani informasi pribadi Anda saat
            menggunakan aplikasi ini. Kami berkomitmen untuk melindungi privasi Anda dan menjaga
            transparansi atas praktik pengelolaan data kami. Silakan baca kebijakan ini dengan
            saksama untuk memahami bagaimana kami mengumpulkan, menggunakan, dan menjaga informasi
            Anda.
          </p>
        </section>

        {/* Data Collection */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Pengumpulan Data</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Aplikasi ini mengumpulkan data minimum yang diperlukan untuk keperluan autentikasi. Saat
            Anda masuk menggunakan penyedia autentikasi kami, kami menerima informasi profil dasar
            seperti alamat email dan nama Anda. Data ini hanya digunakan untuk mengidentifikasi Anda
            di dalam aplikasi dan memberikan akses fitur yang dipersonalisasi.
          </p>
        </section>

        {/* Auth handled by Clerk */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Autentikasi oleh Clerk</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Aplikasi ini menggunakan{' '}
            <a
              href='https://clerk.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary font-medium hover:underline'
            >
              Clerk
            </a>{' '}
            untuk menangani autentikasi pengguna secara aman. Seluruh proses autentikasi, termasuk
            pendaftaran, masuk, dan pengelolaan kata sandi, dikelola oleh Clerk. Untuk informasi
            lebih lanjut tentang bagaimana Clerk memproses dan melindungi data Anda, silakan lihat{' '}
            <a
              href='https://clerk.com/legal/privacy'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary font-medium hover:underline'
            >
              Kebijakan Privasi
            </a>
            .
          </p>
        </section>

        {/* No data misuse */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Tanpa Penyalahgunaan Data</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Kami serius menjaga privasi Anda. Kami memastikan bahwa data pribadi Anda tidak pernah
            dijual, disewakan, atau dibagikan kepada pihak ketiga untuk tujuan pemasaran atau
            komersial. Informasi Anda hanya digunakan untuk fungsi yang memang dimaksudkan oleh
            aplikasi ini dan tidak akan disalahgunakan dalam bentuk apa pun.
          </p>
        </section>

        {/* Demo purpose */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Aplikasi Demo</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Perlu diketahui bahwa ini adalah aplikasi demo yang dibuat untuk tujuan demonstrasi dan
            edukasi. Aplikasi ini menampilkan berbagai fitur dan teknologi, namun belum dianggap
            sebagai layanan siap produksi. Data apa pun yang Anda berikan bisa bersifat sementara
            dan dapat dihapus kapan saja sebagai bagian dari pemeliharaan rutin.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className='text-foreground mb-3 text-xl font-semibold'>Hubungi Kami</h2>
          <p className='text-muted-foreground text-base leading-relaxed'>
            Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait Kebijakan Privasi
            ini atau praktik data kami, silakan hubungi kami di{' '}
            <a
              href='mailto:contact@kiranism.dev'
              className='text-primary font-medium hover:underline'
            >
              contact@kiranism.dev
            </a>
            .
          </p>
        </section>

        {/* Last Updated */}
        <div className='border-border border-t pt-4'>
          <p className='text-muted-foreground text-sm'>Terakhir diperbarui: Februari 2026</p>
        </div>
      </div>
    </div>
  );
}
