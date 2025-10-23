import { useState, useEffect } from 'react';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrophyIcon } from 'lucide-react';
import { referralApi } from '@/lib/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  email: string;
  referralCode: string;
  directReferrals: number;
  totalReferrals: number;
}

export function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
    loadLeaderboard(1);
  }, []);

  const loadUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
  };

  const loadLeaderboard = async (page: number) => {
    setLoading(true);
    try {
      const response = await referralApi.getLeaderboard(page, 50);
      setLeaderboard(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.pages);

      // Find current user's rank
      if (user) {
        const userEntry = response.data.find((entry: LeaderboardEntry) => entry.userId === user.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadLeaderboard(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <TrophyIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">
              Leaderboard
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Top referrers in our community
            </p>
          </div>
        </div>

        {/* User's Rank Card */}
        {userRank && (
          <Card className="bg-gradient-1 border-0 text-white">
            <CardHeader>
              <CardTitle className="text-white">Your Current Rank</CardTitle>
              <CardDescription className="text-white/80">
                Keep referring to climb the leaderboard!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold">#{userRank}</div>
                <div>
                  <p className="text-lg font-semibold">{user?.username}</p>
                  <p className="text-white/80">Keep up the great work!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Leaderboard Table */}
      <section>
        <LeaderboardTable data={leaderboard} title="Global Rankings" />
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className="w-10 h-10 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </section>
      )}

      {/* Stats Summary */}
      <section>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Leaderboard Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{leaderboard.length > 0 ? leaderboard[0]?.totalReferrals : 0}</p>
                <p className="text-sm text-muted-foreground">Top Referrer Count</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {leaderboard.reduce((sum, entry) => sum + entry.totalReferrals, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{leaderboard.length}</p>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
