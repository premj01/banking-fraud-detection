import { Sidebar } from "./Sidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen flex w-full bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10 w-full">
                    <div>
                        {title && <h1 className="text-lg font-semibold">{title}</h1>}
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions, users..."
                                className="pl-9 w-64 bg-muted/50 border-border/50 focus-visible:ring-1"
                            />
                        </div>

                        {/* Live indicator */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                        </div>

                        <ThemeToggle />

                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-medium flex items-center justify-center text-white">
                                        3
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[380px]">
                                <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                                    <p className="font-semibold text-sm">Notifications</p>
                                    <span className="text-xs text-muted-foreground">3 Unread</span>
                                </div>
                                <div className="py-2">
                                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                            <p className="font-medium text-sm">High Value Fraud Alert</p>
                                            <span className="ml-auto text-xs text-muted-foreground">2m ago</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
                                            Transaction #TXN-89201 flagged for ₹4,50,000. Immediate review required.
                                        </p>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                            <p className="font-medium text-sm">Velocity Check Triggered</p>
                                            <span className="ml-auto text-xs text-muted-foreground">15m ago</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
                                            Multiple transactions detected from IP 192.168.1.1 within 5 minutes.
                                        </p>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                            <p className="font-medium text-sm">System Update</p>
                                            <span className="ml-auto text-xs text-muted-foreground">1h ago</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
                                            ML Model v2.4 initialized with 96% accuracy.
                                        </p>
                                    </DropdownMenuItem>
                                </div>
                                <div className="border-t border-border/50 p-2">
                                    <Button variant="ghost" className="w-full h-8 text-xs">
                                        View All Notifications
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {children}
                </main>
            </div>
        </div>
    );
}
