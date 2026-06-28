'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@/components/themes/theme-provider';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant='outline' size='icon' />;
  }

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

export default ThemeToggle;
