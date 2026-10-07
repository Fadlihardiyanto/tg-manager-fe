export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative min-h-svh w-full bg-background overflow-hidden'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.06),transparent_55%)]' />
      <div className='absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl -z-10' />
      {children}
    </div>
  );
}
