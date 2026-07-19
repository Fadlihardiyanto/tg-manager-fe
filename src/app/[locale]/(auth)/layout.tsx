export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative min-h-svh w-full bg-background overflow-hidden'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.06),transparent_50%),radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.04),transparent_50%)]' />
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.03),transparent_50%)]' />
      <div className='absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl -z-10' />
      <div className='absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/[0.04] blur-3xl -z-10' />
      {children}
    </div>
  );
}
