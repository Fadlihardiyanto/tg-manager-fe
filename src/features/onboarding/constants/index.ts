export const COMMUNITY_CATEGORIES = [
  { value: 'trading', label: 'Trading & Sinyal' },
  { value: 'education', label: 'Edukasi & Kursus' },
  { value: 'crypto', label: 'Kripto & Web3' },
  { value: 'finance', label: 'Keuangan & Investasi' },
  { value: 'tech', label: 'Teknologi & Programming' },
  { value: 'health', label: 'Kesehatan & Fitness' },
  { value: 'hobby', label: 'Hobi & Komunitas' },
  { value: 'business', label: 'Bisnis & Networking' },
  { value: 'entertainment', label: 'Hiburan & Konten' },
  { value: 'other', label: 'Lainnya' }
] as const;

export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Workspace Setup',
    description: 'Configure your business profile and community details',
    icon: 'building'
  },
  {
    id: 2,
    title: 'Bot Connection',
    description: 'Connect your Telegram bot for automated interactions',
    icon: 'bot'
  },
  {
    id: 3,
    title: 'Payment Gateway',
    description: 'Set up Midtrans to accept community payments',
    icon: 'creditCard'
  },
  {
    id: 4,
    title: 'Finalize',
    description: 'Review your configuration and launch your workspace',
    icon: 'rocket'
  }
] as const;
