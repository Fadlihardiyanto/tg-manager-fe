import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms for TG-Manager.'
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-svh bg-background'>
      {children}
    </div>
  );
}
