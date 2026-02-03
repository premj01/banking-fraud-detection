import { cn } from "@/lib/utils";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Activity,
    BarChart3,
    Search,
    Users,
    Brain,
    Bell,
    Settings,
    Shield,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Activity, label: 'Real-Time', path: '/monitoring' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Search, label: 'Drill-Down', path: '/drilldown' },
    { icon: Users, label: 'Investigators', path: '/investigators' },
    { icon: Brain, label: 'Model', path: '/model' },
];

const bottomItems = [
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <aside className={cn(
            "h-screen bg-card sticky top-0 flex flex-col border-r border-border transition-all duration-300",
            collapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className={cn(
                "h-16 flex items-center border-b border-border px-4",
                collapsed ? "justify-center" : "justify-between"
            )}>
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-foreground">FraudShield</h1>
                            <p className="text-[10px] text-muted-foreground">Monitoring System</p>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
                        collapsed && "absolute -right-3 top-5 bg-card border border-border"
                    )}
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 shrink-0",
                                isActive && "text-primary"
                            )} />
                            {!collapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom items */}
            <div className="py-4 px-3 space-y-1 border-t border-border">
                {bottomItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {!collapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                        </NavLink>
                    );
                })}
            </div>

            {/* User */}
            <div className="p-4 border-t border-border">
                {collapsed ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="text-sm">
                                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="end" className="w-56">
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-medium">{user?.email}</p>
                                <p className="text-xs text-muted-foreground">Fraud Analyst</p>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="w-4 h-4 mr-2" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-transparent">
                                <div className="flex items-center gap-3 w-full p-2 hover:bg-muted rounded-lg transition-colors">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="text-sm">
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {user?.email || 'User'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Fraud Analyst</p>
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="end" className="w-56">
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-medium">{user?.email}</p>
                                <p className="text-xs text-muted-foreground">Fraud Analyst</p>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="w-4 h-4 mr-2" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </aside>
    );
}
