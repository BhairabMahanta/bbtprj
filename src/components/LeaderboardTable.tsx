import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrophyIcon, MedalIcon, AwardIcon, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  email: string;
  referralCode: string;
  directReferrals: number;
  totalReferrals: number;
  points: number; // Add points
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  title?: string;
  preview?: boolean;
  sortBy?: 'points' | 'referrals'; // Add sortBy prop
}

export function LeaderboardTable({ 
  data, 
  title = 'Leaderboard', 
  preview = false,
  sortBy = 'points' // Default to points
}: LeaderboardTableProps) {
  const displayData = preview ? data.slice(0, 5) : data;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <MedalIcon className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <AwardIcon className="h-5 w-5 text-orange-500" />;
    return null;
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="font-headline text-foreground text-lg sm:text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {displayData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No leaderboard data available yet
            </p>
          ) : (
            displayData.map((entry) => (
              <div
                key={entry.userId}
                className={cn(
                  'flex items-center justify-between p-3 sm:p-4 rounded-lg transition-colors hover:bg-muted',
                  entry.rank <= 3 && 'bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 sm:w-10 flex-shrink-0">
                    {getRankIcon(entry.rank) || (
                      <span className="font-bold text-muted-foreground text-sm sm:text-base">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                    <AvatarImage 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`} 
                      alt={entry.username} 
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(entry.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">
                      {entry.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.directReferrals} direct · {entry.totalReferrals - entry.directReferrals} indirect
                    </p>
                  </div>
                </div>
                
                {/* Show Points or Referrals based on sortBy */}
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 ml-4">
                  {sortBy === 'points' ? (
                    <>
                      {/* Points Display (Primary) */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 mb-0.5">
                          <Award className="h-4 w-4 text-amber-600" />
                          <p className="text-lg sm:text-xl font-bold text-amber-600">
                            {entry.points}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          points
                        </p>
                      </div>
                      {/* Referrals Display (Secondary) */}
                      <div className="text-right hidden sm:block">
                        <p className="text-base font-semibold text-foreground">
                          {entry.totalReferrals}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          referrals
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Referrals Display (Primary) */}
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-foreground">
                          {entry.totalReferrals}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          referrals
                        </p>
                      </div>
                      {/* Points Display (Secondary) */}
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center justify-end gap-1 mb-0.5">
                          <Award className="h-4 w-4 text-amber-600" />
                          <p className="text-base font-semibold text-amber-600">
                            {entry.points}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          points
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
