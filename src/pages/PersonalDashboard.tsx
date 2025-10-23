import { useState, useEffect } from 'react';
import { UsersIcon, UserPlusIcon, TrendingUpIcon, CopyIcon, CheckIcon, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';

import { LeaderboardTable } from '@/components/LeaderboardTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { referralApi } from '@/lib/api';

interface ReferralStats {
  userId: string;
  username: string;
  referralCode: string;
  directReferrals: number;
  totalReferrals: number;
  lastUpdated: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  email: string;
  referralCode: string;
  directReferrals: number;
  totalReferrals: number;
}

export function PersonalDashboard() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        window.location.href = '/login';
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Fetch referral stats
      const statsResponse = await referralApi.getStats(userData.id);
      setStats(statsResponse.data);

      // Fetch leaderboard (top 5)
      const leaderboardResponse = await referralApi.getLeaderboard(1, 5);
      setLeaderboard(leaderboardResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralLink = async () => {
    if (!user?.referralCode) return;

    const text = `${window.location.origin}/signup?ref=${user.referralCode}`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        fallbackCopyText(text);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const indirectReferrals = (stats?.totalReferrals || 0) - (stats?.directReferrals || 0);

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      {/* Welcome Section */}
      <section>
        <Card className="bg-gradient-2 border-0 shadow-lg">
          <CardContent className="p-6 sm:p-8 md:p-10">
            <div className="max-w-full md:max-w-2xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-headline text-white mb-3 sm:mb-4">
                Welcome back, {user?.username || 'User'}!
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6">
                Your referral code:{' '}
                <span className="font-mono font-bold break-all">{user?.referralCode || 'N/A'}</span>
              </p>
              <Button
                onClick={handleCopyReferralLink}
                className="bg-white text-gray-900 hover:bg-gray-100 font-medium h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base transition-colors"
              >
                {copied ? (
                  <>
                    <CheckIcon className="mr-2 w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="mr-2 w-5 h-5" />
                    Copy Referral Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Metrics Section */}
      <section className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline text-foreground">
          Your Referral Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            icon={UsersIcon}
            title="Total Referrals"
            value={stats?.totalReferrals || 0}
            description="Direct + Indirect"
          />
          <MetricCard
            icon={UserPlusIcon}
            title="Direct Referrals"
            value={stats?.directReferrals || 0}
            description="People you referred"
          />
          <MetricCard
            icon={TrendingUpIcon}
            title="Indirect Referrals"
            value={indirectReferrals}
            description="Secondary referrals"
          />
        </div>
      </section>

      {/* Image Banner Section */}
      <section>
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
          <img
            src="https://c.animaapp.com/mh24xt4khAF0wm/img/ai_2.png"
            alt="Data growth analytics"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center px-6 sm:px-8 md:px-12">
            <div className="max-w-full sm:max-w-md md:max-w-lg">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline text-white mb-2 sm:mb-3">
                Track Your Impact
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-white/90">
                See how your referrals grow and contribute to the community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline text-foreground">
            Top Referrers
          </h2>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard/leaderboard'}
            className="text-sm"
          >
            View Full Leaderboard
          </Button>
        </div>
        <LeaderboardTable data={leaderboard} title="Leaderboard Preview" preview />
      </section>
    </div>
  );
}
