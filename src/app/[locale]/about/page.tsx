import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang'
};

export default function AboutPage() {
  return (
    <div className='min-h-screen px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <h1 className='text-foreground text-3xl font-bold tracking-tight sm:text-4xl'>Tentang</h1>
          <p className='text-muted-foreground mt-4 text-lg'>
            Pelajari lebih lanjut tentang proyek ini
          </p>
        </div>

        {/* Content Sections */}
        <div className='space-y-8'>
          {/* Open Source Section */}
          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>Proyek Open Source</h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              Ini adalah starter dashboard admin Next.js open source yang dibangun dengan teknologi
              web modern. Proyek ini menyediakan fondasi yang solid untuk membangun antarmuka admin
              dan dashboard yang kuat. Kode sumbernya tersedia bebas untuk digunakan, dimodifikasi,
              dan didistribusikan.
            </p>
          </section>

          {/* Demo Purpose Section */}
          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>Tujuan Demo</h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              Aplikasi ini berfungsi sebagai demo untuk tujuan demonstrasi. Di sini ditampilkan
              fitur, komponen, dan kemampuan starter dashboard admin. Silakan jelajahi antarmuka,
              uji fungsinya, dan nilai apakah sesuai dengan kebutuhan proyek Anda.
            </p>
          </section>

          {/* Auth Section */}
          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>Autentikasi oleh Clerk</h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              Autentikasi untuk aplikasi ini ditangani secara aman oleh{' '}
              <a
                href='https://clerk.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary font-medium hover:underline'
              >
                Clerk
              </a>
              , platform autentikasi dan manajemen pengguna modern. Clerk menyediakan masuk aman,
              pengelolaan sesi, dan perlindungan data pengguna secara bawaan.
            </p>
          </section>

          {/* Data Privacy Section */}
          <section className='bg-card rounded-2xl border p-8 shadow-sm'>
            <h2 className='text-foreground mb-4 text-xl font-semibold'>Privasi Data</h2>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              Kami serius menjaga privasi Anda. Tidak ada data pribadi yang disalahgunakan,
              dibagikan, atau dijual ke pihak ketiga. Informasi apa pun yang dikumpulkan selama
              penggunaan aplikasi demo ini hanya dipakai untuk keperluan demonstrasi dan ditangani
              sesuai praktik terbaik perlindungan data.
            </p>
          </section>
        </div>

        {/* Footer Note */}
        <div className='mt-12 text-center'>
          <p className='text-muted-foreground text-sm'>
            Dibangun dengan Next.js, Tailwind CSS, dan shadcn/ui
          </p>
        </div>
      </div>
    </div>
  );
}
