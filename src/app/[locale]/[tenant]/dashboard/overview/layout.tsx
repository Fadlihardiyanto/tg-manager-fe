import React from 'react';

export default function OverViewLayout({
  children,
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  children: React.ReactNode;
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return <>{children}</>;
}
