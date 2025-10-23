import { SearchIcon, BellIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getInitials = (username: string) => {
    if (!username) return 'U';
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call logout API if refresh token exists
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('pendingVerificationEmail');
      
      // Redirect to login
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 sm:h-20 items-center justify-between border-b border-border bg-card px-4 sm:px-6 md:px-8 lg:px-12">
      {/* Desktop Search */}
      <div className="hidden md:flex flex-1 items-center gap-4">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={searchOpen}
              className="w-full max-w-md justify-start bg-background text-muted-foreground hover:bg-muted hover:text-foreground border-border h-10"
            >
              <SearchIcon className="mr-2 w-4 h-4" />
              <span className="text-sm">Search...</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 bg-popover text-popover-foreground" align="start">
            <Command>
              <CommandInput placeholder="Search users, referrals..." className="text-foreground" />
              <CommandList>
                <CommandEmpty className="text-muted-foreground">No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions" className="text-foreground">
                  <CommandItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onSelect={() => {
                      navigate('/dashboard');
                      setSearchOpen(false);
                    }}
                  >
                    View Dashboard
                  </CommandItem>
                  <CommandItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onSelect={() => {
                      navigate('/dashboard/leaderboard');
                      setSearchOpen(false);
                    }}
                  >
                    Check Leaderboard
                  </CommandItem>
                  <CommandItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onSelect={() => {
                      navigate('/dashboard/referrals');
                      setSearchOpen(false);
                    }}
                  >
                    My Referrals
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Title */}
      <div className="md:hidden flex-1 flex items-center pl-14">
        <span className="font-headline text-xl sm:text-2xl font-bold text-primary">RefDash</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Search Icon */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden relative bg-transparent text-foreground hover:bg-muted hover:text-foreground w-10 h-10"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <SearchIcon className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative bg-transparent text-foreground hover:bg-muted hover:text-foreground w-10 h-10"
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-tertiary"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative rounded-full bg-transparent hover:bg-muted w-10 h-10 p-0">
              <Avatar className="w-full h-full">
                <AvatarImage 
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                  alt={user?.username || 'User'} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(user?.username || 'User')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover text-popover-foreground" align="end">
            <DropdownMenuLabel className="text-foreground">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              className="text-foreground hover:bg-muted text-sm cursor-pointer"
              onClick={() => navigate('/dashboard/settings')}
            >
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-foreground hover:bg-muted text-sm cursor-pointer"
              onClick={() => navigate('/dashboard/referrals')}
            >
              My Referrals
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              className="text-destructive hover:bg-destructive/10 text-sm cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
