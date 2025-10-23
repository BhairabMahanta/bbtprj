import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, UsersIcon, TrophyIcon, SettingsIcon, LogOutIcon, MenuIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { icon: LayoutDashboardIcon, label: 'Dashboard', path: '/dashboard' },
  { icon: UsersIcon, label: 'Referrals', path: '/dashboard/referrals' },
  { icon: TrophyIcon, label: 'Leaderboard', path: '/dashboard/leaderboard' },
  { icon: SettingsIcon, label: 'Profile', path: '/dashboard/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out',
          collapsed ? 'w-[5vw] min-w-[80px]' : 'w-[16vw] min-w-[240px]'
        )}
      >
        <div className="flex h-[8vh] min-h-[64px] items-center justify-between px-[1.5vw] border-b border-border">
          {!collapsed && (
            <span className="font-headline text-[clamp(1.125rem,1.5vw,1.5rem)] font-bold text-primary">RefDash</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground w-[2.5vw] h-[2.5vw] min-w-[40px] min-h-[40px]"
          >
            {collapsed ? <MenuIcon className="w-[1.25vw] h-[1.25vw] min-w-[20px] min-h-[20px]" /> : <XIcon className="w-[1.25vw] h-[1.25vw] min-w-[20px] min-h-[20px]" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-[0.5vh] p-[1vw]">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-[0.75vw] rounded-lg px-[0.75vw] py-[1.5vh] transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-[1.25vw] h-[1.25vw] min-w-[20px] min-h-[20px] flex-shrink-0" />
                {!collapsed && <span className="font-medium text-[clamp(0.875rem,1vw,1rem)]">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="p-[1vw]">
          <button
            className={cn(
              'flex w-full items-center gap-[0.75vw] rounded-lg px-[0.75vw] py-[1.5vh] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            )}
          >
            <LogOutIcon className="w-[1.25vw] h-[1.25vw] min-w-[20px] min-h-[20px] flex-shrink-0" />
            {!collapsed && <span className="font-medium text-[clamp(0.875rem,1vw,1rem)]">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-[2vh] left-[4vw] z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-card text-foreground hover:bg-muted hover:text-foreground shadow-lg w-[12vw] h-[12vw] min-w-[48px] min-h-[48px]"
        >
          <MenuIcon className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px]" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-full w-[75vw] max-w-[300px] bg-card border-r border-border z-50 transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-[8vh] min-h-[64px] items-center justify-between px-[4vw] border-b border-border">
          <span className="font-headline text-[clamp(1.25rem,5vw,1.5rem)] font-bold text-primary">RefDash</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground w-[10vw] h-[10vw] min-w-[40px] min-h-[40px]"
          >
            <XIcon className="w-[5vw] h-[5vw] min-w-[20px] min-h-[20px]" />
          </Button>
        </div>

        <nav className="flex-1 space-y-[1vh] p-[4vw] mt-[2vh]">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-[3vw] rounded-lg px-[4vw] py-[2vh] transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] flex-shrink-0" />
                <span className="font-medium text-[clamp(1rem,4vw,1.125rem)]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="p-[4vw]">
          <button
            className={cn(
              'flex w-full items-center gap-[3vw] rounded-lg px-[4vw] py-[2vh] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            )}
          >
            <LogOutIcon className="w-[6vw] h-[6vw] min-w-[24px] min-h-[24px] flex-shrink-0" />
            <span className="font-medium text-[clamp(1rem,4vw,1.125rem)]">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
