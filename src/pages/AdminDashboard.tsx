import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  UserCheckIcon, 
  TrophyIcon, 
  TrendingUpIcon, 
  Loader2, 
  AlertCircle,
  TestTube2,
  Trash2,
  RefreshCw,
  Award,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi, referralApi, authApi } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  testUsers: number;
  realUsers: number;
  totalReferrals: number;
  topReferrer: {
    username: string;
    referrals: number;
  } | null;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  email: string;
  referralCode: string;
  directReferrals: number;
  totalReferrals: number;
  points: number;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Test data generation state
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [levels, setLevels] = useState(3);
  const [usersPerLevel, setUsersPerLevel] = useState(2);
  
  // Feedback messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get current user
      const userData = await authApi.getCurrentUser();
      setCurrentUser(userData);

      // Check if user is admin
      if (!userData.isAdmin) {
        setErrorMessage('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // Load admin stats
      const statsResponse = await adminApi.getStats();
      setStats(statsResponse.data);

      // Load leaderboard
      const leaderboardResponse = await referralApi.getLeaderboard(1, 10, 'points');
      setLeaderboard(leaderboardResponse.data);
    } catch (error: any) {
      console.error('Error loading admin dashboard:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestData = async () => {
    if (!currentUser?.id) {
      setErrorMessage('User not found');
      return;
    }

    setGenerating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result = await adminApi.generateTestData(currentUser.id, levels, usersPerLevel);
      setSuccessMessage(result.message);
      
      // Reload dashboard data
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    } catch (error: any) {
      console.error('Error generating test data:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to generate test data');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteTestData = async () => {
    if (!confirm('Are you sure you want to delete ALL test data? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result = await adminApi.deleteTestData();
      setSuccessMessage(result.message);
      
      // Reload dashboard data
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    } catch (error: any) {
      console.error('Error deleting test data:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to delete test data');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefreshAllStats = async () => {
    if (!confirm('This will recalculate stats for all users. Continue?')) {
      return;
    }

    setRefreshing(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const result = await adminApi.refreshAllStats();
      setSuccessMessage(result.message);
      
      // Reload dashboard data
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    } catch (error: any) {
      console.error('Error refreshing stats:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to refresh stats');
    } finally {
      setRefreshing(false);
    }
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need admin privileges to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Monitor and manage the referral system
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Messages */}
      {successMessage && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <AlertDescription className="text-green-600">
            {successMessage}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={clearMessages}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={clearMessages}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
          System Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-card text-card-foreground border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Users</p>
                  <p className="text-3xl font-bold font-headline text-foreground">
                    {stats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.realUsers || 0} real, {stats?.testUsers || 0} test
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <UsersIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Verified Users</p>
                  <p className="text-3xl font-bold font-headline text-foreground">
                    {stats?.verifiedUsers || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.totalUsers ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}% verified
                  </p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <UserCheckIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Referrals</p>
                  <p className="text-3xl font-bold font-headline text-foreground">
                    {stats?.totalReferrals || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </div>
                <div className="rounded-lg bg-secondary/10 p-3">
                  <TrendingUpIcon className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Top Referrer</p>
                  <p className="text-2xl font-bold font-headline text-amber-600">
                    {stats?.topReferrer?.referrals || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stats?.topReferrer?.username || 'No data'}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <TrophyIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Test Data Management */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
          Test Data Management
        </h2>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="font-headline text-foreground flex items-center gap-2">
              <TestTube2 className="h-5 w-5" />
              Generate Test Referral Tree
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-500/5 border-blue-500/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-muted-foreground">
                This will create a test referral tree under your account. Test users have email addresses ending with @testuser.local
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="levels">Number of Levels</Label>
                <Input
                  id="levels"
                  type="number"
                  min="1"
                  max="5"
                  value={levels}
                  onChange={(e) => setLevels(parseInt(e.target.value) || 1)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  How many generation levels (1-5)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usersPerLevel">Users Per Level</Label>
                <Input
                  id="usersPerLevel"
                  type="number"
                  min="1"
                  max="5"
                  value={usersPerLevel}
                  onChange={(e) => setUsersPerLevel(parseInt(e.target.value) || 1)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Users per parent at each level (1-5)
                </p>
              </div>
            </div>

<div className="p-4 rounded-lg bg-muted">
  <p className="text-sm text-foreground font-medium mb-2">Preview:</p>
  <p className="text-sm text-muted-foreground">
    This will create approximately{' '}
    <span className="font-bold text-foreground">
      {(() => {
        let total = 0;
        for (let i = 1; i <= levels; i++) {
          total += Math.pow(usersPerLevel, i);
        }
        return total;
      })()}
    </span>{' '}
    test users across {levels} generation levels.
  </p>
  <p className="text-xs text-muted-foreground mt-2">
    (Level 1: {usersPerLevel}, Level 2: {Math.pow(usersPerLevel, 2)}, 
    Level 3: {Math.pow(usersPerLevel, 3)}, etc.)
  </p>
</div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGenerateTestData}
                disabled={generating}
                className="bg-primary text-primary-foreground"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <TestTube2 className="mr-2 h-4 w-4" />
                    Generate Test Data
                  </>
                )}
              </Button>

              <Button
                onClick={handleDeleteTestData}
                disabled={deleting}
                variant="destructive"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Test Data
                  </>
                )}
              </Button>

              <Button
                onClick={handleRefreshAllStats}
                disabled={refreshing}
                variant="outline"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh All Stats
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Top Referrers Leaderboard */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
          Top Referrers (By Points)
        </h2>
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="p-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <TrophyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No data yet</p>
                <p className="text-sm text-muted-foreground">
                  Referral data will appear here once users start referring others
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg transition-colors hover:bg-muted gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-8">
                        {entry.rank <= 3 ? (
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            entry.rank === 1 ? 'bg-amber-500/20' :
                            entry.rank === 2 ? 'bg-gray-400/20' :
                            'bg-orange-700/20'
                          }`}>
                            <span className={`font-bold ${
                              entry.rank === 1 ? 'text-amber-600' :
                              entry.rank === 2 ? 'text-gray-600' :
                              'text-orange-700'
                            }`}>
                              #{entry.rank}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-muted-foreground">#{entry.rank}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{entry.username}</p>
                        <p className="text-sm text-muted-foreground">{entry.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 ml-12 sm:ml-0">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-600" />
                          <span className="text-lg font-bold text-amber-600">{entry.points}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{entry.totalReferrals}</p>
                        <p className="text-xs text-muted-foreground">total referrals</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{entry.directReferrals}</p>
                        <p className="text-xs text-muted-foreground">direct</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
