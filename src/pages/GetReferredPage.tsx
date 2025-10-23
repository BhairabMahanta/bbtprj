import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, UserPlus, ArrowLeft } from 'lucide-react';
import { referralApi, authApi } from '@/lib/api';

export function GetReferredPage() {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
      navigate('/login');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const validateReferralCode = async () => {
      if (referralCode && referralCode.length >= 6) {
        setValidating(true);
        try {
          // Check if it's the user's own code
          if (referralCode === user?.referralCode) {
            setReferralValid(false);
            setReferrerName('');
            setError('You cannot refer yourself');
            setValidating(false);
            return;
          }

          const response = await referralApi.validateReferralCode(referralCode);
          if (response.valid) {
            setReferralValid(true);
            setReferrerName(response.data.referrerName);
            setError('');
          } else {
            setReferralValid(false);
            setReferrerName('');
            setError('Invalid referral code');
          }
        } catch (error) {
          setReferralValid(false);
          setReferrerName('');
          setError('Invalid referral code');
        } finally {
          setValidating(false);
        }
      } else if (referralCode === '') {
        setReferralValid(null);
        setReferrerName('');
        setError('');
      }
    };

    const debounceTimer = setTimeout(validateReferralCode, 500);
    return () => clearTimeout(debounceTimer);
  }, [referralCode, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!referralCode) {
      setError('Please enter a referral code');
      return;
    }

    if (referralValid !== true) {
      setError('Please enter a valid referral code');
      return;
    }

    if (!user?.id) {
      setError('User not found. Please log in again.');
      return;
    }

    setLoading(true);

    try {
      const response = await referralApi.addReferrer(user.id, referralCode);
      setSuccess(response.message || 'Referral code added successfully!');
      
      // Refresh user data
      await loadUserData();
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/referrals');
      }, 2000);
    } catch (error: any) {
      console.error('Add referrer error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add referral code. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralCode(e.target.value);
    if (error) setError('');
    if (success) setSuccess('');
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasReferrer = user?.referredBy;

  return (
    <div className="space-y-8">
      <section className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/referrals')}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">
            Get Referred
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Add a referrer to join their network
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto">
        {hasReferrer ? (
          <Card className="bg-card text-card-foreground border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline text-foreground">
                Already Referred
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                You're already part of a referral network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Your referrer's code:</p>
                <p className="text-lg font-mono font-bold text-foreground">{user.referredBy}</p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                You can only be referred once. Start referring others to grow your network!
              </p>
              <Button
                onClick={() => navigate('/dashboard/referrals')}
                className="w-full bg-gradient-1 text-white hover:opacity-90"
              >
                View My Referrals
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card text-card-foreground border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-1 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-headline text-foreground">
                Join a Referral Network
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Enter someone's referral code to join their network and help them grow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded-md bg-green-500/10 border border-green-500">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="referralCode" className="text-foreground text-sm">
                    Referral Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={handleChange}
                      disabled={loading}
                      className={`bg-background text-foreground border-border h-12 text-base pr-10 ${
                        error && referralCode ? 'border-destructive' : 
                        referralValid === true ? 'border-green-500' : 
                        referralValid === false ? 'border-destructive' : ''
                      }`}
                    />
                    {validating && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                    {!validating && referralValid === true && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                    {!validating && referralValid === false && referralCode && (
                      <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                    )}
                  </div>
                  {referralValid === true && referrerName && (
                    <p className="text-green-600 text-sm">
                      You'll be joining {referrerName}'s network
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || validating || referralValid !== true}
                  className="w-full bg-gradient-1 text-white hover:opacity-90 h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Referral Code'
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Note: You can only be referred once</p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
