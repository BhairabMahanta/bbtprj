import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { UsersIcon, UserPlusIcon, TrendingUpIcon } from 'lucide-react';

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    avatar?: string;
    email: string;
    directReferrals: number;
    indirectReferrals: number;
    totalReferrals: number;
  } | null;
}

export function UserDetailModal({ open, onOpenChange, user }: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">User Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detailed referral information for this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{user.totalReferrals}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="rounded-lg bg-secondary/10 p-2">
                <UserPlusIcon className="h-5 w-5 text-secondary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{user.directReferrals}</p>
            <p className="text-xs text-muted-foreground">Direct</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="rounded-lg bg-tertiary/10 p-2">
                <TrendingUpIcon className="h-5 w-5 text-tertiary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{user.indirectReferrals}</p>
            <p className="text-xs text-muted-foreground">Indirect</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
