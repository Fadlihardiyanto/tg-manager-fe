"use client";

import { Icons, type Icon } from "@/components/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        { icon: Icons.add, listtitle: "Add" },
        { icon: Icons.edit, listtitle: "Edit" },
        { icon: Icons.trash, listtitle: "Delete" },
    ];

    const checkboxTableData: ProjectData[] = [
        {
            project: 'Web App Project',
            date: "04 June 2026",
            budget: '12,000',
            icon: Icons.laptop,
            iconcolor: 'text-orange-400',
            iconbg: 'bg-orange-400/20',
            avatar: "https://api.slingacademy.com/public/sample-users/1.png",
            name: 'Olivia Rhye',
            handle: 'olivia@ui.com',
            progress: 60,
            progressColor: '**:data-[slot=progress-indicator]:bg-orange-400'
        },
        {
            project: 'MaterialM Admin',
            date: "09 January 2026",
            budget: '8000',
            icon: Icons.sparkles,
            iconcolor: 'text-sky-400',
            iconbg: 'bg-sky-400/20',
            avatar: "https://api.slingacademy.com/public/sample-users/2.png",
            name: 'Barbara Steele',
            handle: 'steele@ui.com',
            progress: 30,
            progressColor: '**:data-[slot=progress-indicator]:bg-blue-500'
        },
        {
            project: 'Digital Marketing',
            date: "15 April 2026",
            budget: '15,000',
            icon: Icons.notification,
            iconcolor: 'text-teal-400',
            iconbg: 'bg-teal-400/20',
            avatar: "https://api.slingacademy.com/public/sample-users/3.png",
            name: 'Leonard Gordon',
            handle: 'olivia@ui.com',
            progress: 45,
            progressColor: '**:data-[slot=progress-indicator]:bg-amber-300'
        },
        {
            project: 'Shadcn Space Design',
            date: "30 March 2026",
            budget: '1000',
            icon: Icons.brightness,
            iconcolor: 'text-red-500',
            iconbg: 'bg-red-500/20',
            avatar: "https://api.slingacademy.com/public/sample-users/4.png",
            name: 'Evelyn Pope',
            handle: 'steele@ui.com',
            progress: 37,
            progressColor: '**:data-[slot=progress-indicator]:bg-red-500'
        },
        {
            project: 'Graphic Design',
            date: "23 October 2026",
            budget: '7000',
            icon: Icons.palette,
            iconcolor: 'text-blue-500',
            iconbg: 'bg-blue-500/20',
            avatar: "https://api.slingacademy.com/public/sample-users/5.png",
            name: 'Tommy Garza',
            handle: 'olivia@ui.com',
            progress: 87,
            progressColor: '**:data-[slot=progress-indicator]:bg-teal-400'
        },
    ];

    return (
        <Card className="w-full overflow-hidden pb-0 pt-6 gap-6">
            <CardHeader className='px-6'>
                <CardTitle>Top Projects</CardTitle>
                <CardDescription>Checkout the statistics of top projects</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="overflow-x-auto">
                    <Table className="min-w-[800px]">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-border/80">
                                <TableHead className="p-3 ps-6">#</TableHead>
                                <TableHead className="p-2">Project Name</TableHead>
                                <TableHead className="p-2">Budget</TableHead>
                                <TableHead className="p-2">Manager</TableHead>
                                <TableHead className="p-2">Progress</TableHead>
                                <TableHead className="p-3 pe-6 flex justify-end">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-border/80">
                            {checkboxTableData.map((item, index) => (
                                <TableRow key={index} className="group hover:bg-muted/50 transition-all duration-300">
                                    {/* Checkbox */}
                                    <TableCell className="whitespace-nowrap p-3 ps-6">
                                        <Checkbox className="cursor-pointer border-muted-foreground/40 dark:border-muted-foreground/60 transition-colors" />
                                    </TableCell>

                                    {/* project */}
                                    <TableCell className="whitespace-nowrap p-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", item.iconbg)}>
                                                <item.icon width={20} height={20} className={cn(item.iconcolor)} />
                                            </div>
                                            <div>
                                                <h6 className="text-sm font-semibold">{item.project}</h6>
                                                <p className="text-xs text-muted-foreground">{item.date}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Status Badge */}
                                    <TableCell className="whitespace-nowrap p-3">
                                        <p className="text-sm font-medium text-foreground">
                                            ${item.budget}
                                        </p>
                                    </TableCell>

                                    {/* Customer */}
                                    <TableCell className="whitespace-nowrap p-3">
                                        <div className="flex gap-3 items-center">
                                            <img
                                                src={item.avatar}
                                                alt="icon"
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                            <div className="truncate line-clamp-2 max-w-56">
                                                <h6 className="text-sm font-semibold">{item.name}</h6>
                                                <p className="text-xs text-muted-foreground">{item.handle}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Progress */}
                                    <TableCell className="whitespace-nowrap p-3 w-48">
                                        <Progress
                                            value={item.progress}
                                            className={cn("w-full h-1.5 [&>div]:h-1.5", `${item.progressColor}`)}
                                        />
                                    </TableCell>

                                    {/* Dropdown Menu */}
                                    <TableCell className="whitespace-nowrap p-3 pe-6">
                                        <div className="flex items-center justify-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <span className="flex justify-center items-center rounded-full p-2 hover:bg-muted cursor-pointer transition-colors">
                                                        <Icons.ellipsis width={18} height={18} />
                                                    </span>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent align="end">
                                                    {tableActionData.map((action, idx) => (
                                                        <DropdownMenuItem key={idx} className="group flex items-center gap-3 cursor-pointer">
                                                            <action.icon className="h-4 w-4" />
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
