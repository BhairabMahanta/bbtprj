import { useState, useEffect } from 'react';
import { UsersIcon, UserCheckIcon, TrophyIcon, TrendingUpIcon } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { ReferralTreeGraph } from '@/components/ReferralTreeGraph';

import { UserDetailModal } from '@/components/UserDetailModel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockOverviewData = [
  { name: 'Week 1', referrals: 45 },
  { name: 'Week 2', referrals: 62 },
  { name: 'Week 3', referrals: 78 },
  { name: 'Week 4', referrals: 95 },
];

const mockLeaderboard = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', referrals: 156, rank: 1, directReferrals: 98, indirectReferrals: 58, totalReferrals: 156 },
  { id: '2', name: 'Michael Chen', email: 'michael@example.com', referrals: 142, rank: 2, directReferrals: 85, indirectReferrals: 57, totalReferrals: 142 },
  { id: '3', name: 'Emma Williams', email: 'emma@example.com', referrals: 128, rank: 3, directReferrals: 76, indirectReferrals: 52, totalReferrals: 128 },
  { id: '4', name: 'James Brown', email: 'james@example.com', referrals: 115, rank: 4, directReferrals: 68, indirectReferrals: 47, totalReferrals: 115 },
  { id: '5', name: 'Olivia Davis', email: 'olivia@example.com', referrals: 98, rank: 5, directReferrals: 59, indirectReferrals: 39, totalReferrals: 98 },
  { id: '6', name: 'William Martinez', email: 'william@example.com', referrals: 87, rank: 6, directReferrals: 52, indirectReferrals: 35, totalReferrals: 87 },
  { id: '7', name: 'Sophia Anderson', email: 'sophia@example.com', referrals: 76, rank: 7, directReferrals: 45, indirectReferrals: 31, totalReferrals: 76 },
  { id: '8', name: 'Liam Taylor', email: 'liam@example.com', referrals: 65, rank: 8, directReferrals: 38, indirectReferrals: 27, totalReferrals: 65 },
];

export function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<typeof mockLeaderboard[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUserClick = (user: typeof mockLeaderboard[0]) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold font-headline text-foreground">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Monitor and analyze referral activity across the platform
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-headline text-foreground">Overview Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            icon={UsersIcon}
            title="Total Users"
            value="1,247"
            description="Active members"
          />
          <MetricCard
            icon={UserCheckIcon}
            title="Total Referrals"
            value="3,892"
            description="All time"
          />
          <MetricCard
            icon={TrophyIcon}
            title="Top Referrer"
            value="156"
            description="Sarah Johnson"
          />
          <MetricCard
            icon={TrendingUpIcon}
            title="Growth Rate"
            value="+23%"
            description="This month"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-headline text-foreground">Weekly Activity</h2>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader className="bg-gradient-1 rounded-t-lg">
            <CardTitle className="font-headline text-white">Referral Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockOverviewData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(176, 68%, 44%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(176, 68%, 44%)" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 90%)" />
                <XAxis dataKey="name" stroke="hsl(210, 10%, 40%)" />
                <YAxis stroke="hsl(210, 10%, 40%)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(210, 15%, 90%)',
                    borderRadius: '0.5rem',
                    color: 'hsl(222, 27%, 12%)'
                  }}
                />
                <Bar
                  dataKey="referrals"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-headline text-foreground">Referral Network Visualization</h2>
        <ReferralTreeGraph title="Global Referral Tree" />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold font-headline text-foreground">Top Referrers</h2>
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="p-6">
            <div className="space-y-4">
              {mockLeaderboard.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleUserClick(entry)}
                  className="flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-muted cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      <span className="font-bold text-muted-foreground">#{entry.rank}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{entry.referrals}</p>
                    <p className="text-sm text-muted-foreground">referrals</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <UserDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
      />
    </div>
  );
}
