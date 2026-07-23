'use client';

import { Icons, type Icon } from '@/components/icons';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TableAction {
  icon: Icon;
  listtitle: string;
}

interface ProjectData {
  project: string;
  date: string;
  budget: string;
  icon: Icon;
  iconcolor: string;
  iconbg: string;
  avatar: string;
  name: string;
  handle: string;
  progress: number;
  progressColor: string;
}

export function TopProjectsTable() {
  const tableActionData: TableAction[] = [
    { icon: Icons.add, listtitle: 'Tambah' },
    { icon: Icons.edit, listtitle: 'Ubah' },
    { icon: Icons.trash, listtitle: 'Hapus' }
  ];

  const checkboxTableData: ProjectData[] = [
    {
      project: 'Proyek Aplikasi Web',
      date: '04 Juni 2026',
      budget: '12,000',
      icon: Icons.laptop,
      iconcolor: 'text-orange-400',
      iconbg: 'bg-orange-400/20',
      avatar: 'https://api.slingacademy.com/public/sample-users/1.png',
      name: 'Olivia Rhye',
      handle: 'olivia@ui.com',
      progress: 60,
      progressColor: '**:data-[slot=progress-indicator]:bg-orange-400'
    },
    {
      project: 'Admin MaterialM',
      date: '09 Januari 2026',
      budget: '8000',
      icon: Icons.sparkles,
      iconcolor: 'text-sky-400',
      iconbg: 'bg-sky-400/20',
      avatar: 'https://api.slingacademy.com/public/sample-users/2.png',
      name: 'Barbara Steele',
      handle: 'steele@ui.com',
      progress: 30,
      progressColor: '**:data-[slot=progress-indicator]:bg-blue-500'
    },
    {
      project: 'Pemasaran Digital',
      date: '15 April 2026',
      budget: '15,000',
      icon: Icons.notification,
      iconcolor: 'text-teal-400',
      iconbg: 'bg-teal-400/20',
      avatar: 'https://api.slingacademy.com/public/sample-users/3.png',
      name: 'Leonard Gordon',
      handle: 'olivia@ui.com',
      progress: 45,
      progressColor: '**:data-[slot=progress-indicator]:bg-amber-300'
    },
    {
      project: 'Desain Ruang Shadcn',
      date: '30 Maret 2026',
      budget: '1000',
      icon: Icons.brightness,
      iconcolor: 'text-red-500',
      iconbg: 'bg-red-500/20',
      avatar: 'https://api.slingacademy.com/public/sample-users/4.png',
      name: 'Evelyn Pope',
      handle: 'steele@ui.com',
      progress: 37,
      progressColor: '**:data-[slot=progress-indicator]:bg-red-500'
    },
    {
      project: 'Desain Grafis',
      date: '23 Oktober 2026',
      budget: '7000',
      icon: Icons.palette,
      iconcolor: 'text-blue-500',
      iconbg: 'bg-blue-500/20',
      avatar: 'https://api.slingacademy.com/public/sample-users/5.png',
      name: 'Tommy Garza',
      handle: 'olivia@ui.com',
      progress: 87,
      progressColor: '**:data-[slot=progress-indicator]:bg-teal-400'
    }
  ];

  return (
    <Card className='w-full gap-6 overflow-hidden border-border/70 pt-6 pb-0 shadow-sm'>
      <CardHeader className='px-6'>
        <CardTitle className='text-base'>Proyek Teratas</CardTitle>
        <CardDescription>Lihat statistik proyek-proyek teratas</CardDescription>
      </CardHeader>
      <CardContent className='px-0'>
        <div className='overflow-x-auto'>
          <Table className='min-w-full'>
            <TableHeader>
              <TableRow className='border-border/80 bg-muted/30 hover:bg-muted/30'>
                <TableHead className='p-3 ps-6 text-xs font-semibold uppercase tracking-wider'>
                  <span aria-label='Nomor'>#</span>
                </TableHead>
                <TableHead className='p-2 text-xs font-semibold uppercase tracking-wider'>
                  Nama Proyek
                </TableHead>
                <TableHead className='p-2 text-xs font-semibold uppercase tracking-wider'>
                  Anggaran
                </TableHead>
                <TableHead className='p-2 text-xs font-semibold uppercase tracking-wider'>
                  Penanggung Jawab
                </TableHead>
                <TableHead className='p-2 text-xs font-semibold uppercase tracking-wider'>
                  Progres
                </TableHead>
                <TableHead className='flex justify-end p-3 pe-6 text-xs font-semibold uppercase tracking-wider'>
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className='divide-y divide-border/80'>
              {checkboxTableData.map((item) => (
                <TableRow
                  key={item.project}
                  className='group transition-colors duration-200 hover:bg-muted/35'
                >
                  {/* Checkbox */}
                  <TableCell className='whitespace-nowrap p-3 ps-6'>
                    <Checkbox className='border-muted-foreground/40 cursor-pointer transition-colors dark:border-muted-foreground/60' />
                  </TableCell>

                  {/* project */}
                  <TableCell className='whitespace-nowrap p-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset ring-black/5',
                          item.iconbg
                        )}
                      >
                        <item.icon width={20} height={20} className={cn(item.iconcolor)} />
                      </div>
                      <div>
                        <h6 className='text-sm font-semibold'>{item.project}</h6>
                        <p className='text-xs text-muted-foreground'>{item.date}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className='whitespace-nowrap p-3'>
                    <p className='text-foreground text-sm font-semibold'>${item.budget}</p>
                  </TableCell>

                  {/* Customer */}
                  <TableCell className='whitespace-nowrap p-3'>
                    <div className='flex items-center gap-3'>
                      <Image
                        src={item.avatar}
                        alt={`${item.name} avatar`}
                        width={36}
                        height={36}
                        className='h-9 w-9 rounded-full border object-cover shadow-xs'
                      />
                      <div className='truncate line-clamp-2 max-w-56'>
                        <h6 className='text-sm font-semibold'>{item.name}</h6>
                        <p className='text-xs text-muted-foreground'>{item.handle}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Progress */}
                  <TableCell className='whitespace-nowrap p-3 w-48'>
                    <Progress
                      value={item.progress}
                      className={cn('w-full h-1.5 [&>div]:h-1.5', `${item.progressColor}`)}
                    />
                  </TableCell>

                  {/* Dropdown Menu */}
                  <TableCell className='whitespace-nowrap p-3 pe-6'>
                    <div className='flex items-center justify-end'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type='button'
                            className='flex cursor-pointer items-center justify-center rounded-full p-2 transition-colors hover:bg-muted'
                            aria-label='Aksi'
                          >
                            <Icons.ellipsis width={18} height={18} />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align='end'>
                          {tableActionData.map((action, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              className='group flex items-center gap-3 cursor-pointer'
                            >
                              <action.icon className='h-4 w-4' />
                              <span>{action.listtitle}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
