import { useState, useEffect } from 'react';
import { UsersIcon, UserPlusIcon, TrendingUpIcon, CalendarIcon, Loader2, UserPlus, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { referralApi, authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Referral {
  _id: string;
  username: string;
  email: string;
  referralCode: string;
  createdAt: string;
  isVerified: boolean;
  directReferrals: number;
  totalReferrals: number;
}

interface ReferralStats {
  userId: string;
  username: string;
  referralCode: string;
  directReferrals: number;
  totalReferrals: number;
}

interface Referrer {
  username: string;
  referralCode: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [directReferrals, setDirectReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [referrer, setReferrer] = useState<Referrer | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    loadReferralData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadDirectReferrals(pagination.page);
    }
  }, [pagination.page, user?.id]);

  const loadReferralData = async () => {
    try {
      // Fetch current user
      const userData = await authApi.getCurrentUser();
      setUser(userData);

      // Fetch referrer if exists
      if (userData.referredBy) {
        try {
          const referrerResponse = await referralApi.getUserByReferralCode(userData.referredBy);
          if (referrerResponse && referrerResponse.data) {
            setReferrer(referrerResponse.data);
          }
        } catch (err) {
          console.error('Failed to fetch referrer info', err);
        }
      }

      // Fetch referral stats
      const statsResponse = await referralApi.getStats(userData.id);
      setStats(statsResponse.data);

      // Fetch direct referrals with pagination
      await loadDirectReferrals(1, userData.id);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectReferrals = async (page: number, userId?: string) => {
    try {
      const id = userId || user?.id;
      if (!id) return;

      const referralsResponse = await referralApi.getDirectReferrals(id, page, 10);
      setDirectReferrals(referralsResponse.data);
      setPagination(referralsResponse.pagination);
    } catch (error) {
      console.error('Error loading direct referrals:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const copyToClipboard = async (text: string, isLink: boolean = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isLink) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const indirectCount = (stats?.totalReferrals || 0) - (stats?.directReferrals || 0);
  const referralCode = stats?.referralCode || user?.referralCode;
  const inviteLink = `${window.location.origin}/signup?ref=${referralCode}`;

  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">My Referrals</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              View and manage all your referrals in one place
            </p>
          </div>
          {!user?.referredBy && (
            <Button
              onClick={() => navigate('/dashboard/get-referred')}
              variant="outline"
              className="flex-shrink-0"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Get Referred
            </Button>
          )}
        </div>
      </section>

      {/* Your Referral Code Section */}
      <section>
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-foreground">Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Share this code with friends</p>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-bold font-mono text-primary bg-background px-4 py-2 rounded-lg border border-primary/20">
                    {referralCode}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(referralCode, false)}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <Separator className="bg-border/50" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Or share this invite link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-background px-3 py-2 rounded border border-border truncate">
                  {inviteLink}
                </code>
                <Button
                  onClick={() => copyToClipboard(inviteLink, true)}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Referrer Info Section */}
      <section>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="font-headline text-foreground">Your Referrer</CardTitle>
          </CardHeader>
          <CardContent>
            {referrer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${referrer.username}`} 
                      alt={referrer.username} 
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(referrer.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{referrer.username}</p>
                    <p className="text-sm text-muted-foreground">Referral Code: {referrer.referralCode}</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-500/10 text-green-600">
                  Connected
                </span>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-base font-medium text-foreground mb-2">No Referrer Yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't been referred by anyone yet
                </p>
                <Button
                  onClick={() => navigate('/dashboard/get-referred')}
                  variant="outline"
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Get Referred
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Referrals</p>
                <p className="text-3xl font-bold font-headline text-foreground">
                  {stats?.totalReferrals || 0}
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
                <p className="text-sm font-medium text-muted-foreground mb-2">Direct Referrals</p>
                <p className="text-3xl font-bold font-headline text-foreground">
                  {stats?.directReferrals || 0}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/10 p-3">
                <UserPlusIcon className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Indirect Referrals</p>
                <p className="text-3xl font-bold font-headline text-foreground">
                  {indirectCount}
                </p>
              </div>
              <div className="rounded-lg bg-tertiary/10 p-3">
                <TrendingUpIcon className="h-6 w-6 text-tertiary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
          Direct Referrals
        </h2>
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <CardTitle className="font-headline text-foreground">
              People You Referred ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pagination.total === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No referrals yet</p>
                <p className="text-sm text-muted-foreground">
                  Share your referral code to start building your network!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {directReferrals.map((referral, index) => (
                    <div key={referral._id}>
                      <div className="flex flex-col gap-4 py-4">
                        {/* User Info Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${referral.username}`} 
                                alt={referral.username} 
                              />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(referral.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">{referral.username}</p>
                              <p className="text-sm text-muted-foreground truncate">{referral.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">{formatDate(referral.createdAt)}</span>
                            </div>
                            <span 
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                referral.isVerified 
                                  ? 'bg-green-500/10 text-green-600' 
                                  : 'bg-yellow-500/10 text-yellow-600'
                              }`}
                            >
                              {referral.isVerified ? 'Active' : 'Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Referral Stats Row */}
                        <div className="flex items-center gap-4 pl-16">
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Direct:</span>
                              <span className="font-semibold text-foreground">{referral.directReferrals}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Total:</span>
                              <span className="font-semibold text-foreground">{referral.totalReferrals}</span>
                            </div>
                            {referral.totalReferrals > 0 && (
                              <div className="text-xs text-muted-foreground">
                                ({referral.totalReferrals - referral.directReferrals} indirect)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {index < directReferrals.length - 1 && <Separator className="bg-border" />}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} referrals
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                          .filter(page => {
                            // Show first page, last page, current page, and pages around current
                            return (
                              page === 1 ||
                              page === pagination.pages ||
                              Math.abs(page - pagination.page) <= 1
                            );
                          })
                          .map((page, idx, arr) => (
                            <>
                              {idx > 0 && arr[idx - 1] !== page - 1 && (
                                <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
                                  ...
                                </span>
                              )}
                              <Button
                                key={page}
                                variant={pagination.page === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-10"
                              >
                                {page}
                              </Button>
                            </>
                          ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {indirectCount > 0 && (
        <section>
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-foreground flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Indirect Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                You have <span className="font-bold text-primary">{indirectCount}</span> indirect referrals 
                through your network. These are people referred by your direct referrals!
              </p>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
