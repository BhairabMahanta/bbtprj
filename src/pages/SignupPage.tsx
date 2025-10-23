import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { authApi, referralApi } from '@/lib/api';

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>('');

  // Validate referral code when component mounts or referral code changes
  useEffect(() => {
    const validateReferralCode = async () => {
      if (formData.referralCode && formData.referralCode.length >= 6) {
        setValidatingReferral(true);
        try {
          const response = await referralApi.validateReferralCode(formData.referralCode);
          if (response.valid) {
            setReferralValid(true);
            setReferrerName(response.data.referrerName);
          } else {
            setReferralValid(false);
            setReferrerName('');
          }
        } catch (error) {
          setReferralValid(false);
          setReferrerName('');
        } finally {
          setValidatingReferral(false);
        }
      } else if (formData.referralCode === '') {
        setReferralValid(null);
        setReferrerName('');
      }
    };

    const debounceTimer = setTimeout(validateReferralCode, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.referralCode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.referralCode && referralValid === false) {
      newErrors.referralCode = 'Invalid referral code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authApi.register(
        formData.username,
        formData.email,
        formData.password,
        formData.referralCode || undefined
      );

      // Navigate to email verification page
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          message: response.message 
        } 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
    if (apiError) {
      setApiError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 sm:p-6 md:p-8 py-8">
      <Card className="w-full max-w-md lg:max-w-lg bg-card text-card-foreground border-border shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-1 rounded-full flex items-center justify-center mb-2">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline text-foreground">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">
            Join our referral network today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive">
                <p className="text-destructive text-sm">{apiError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground text-sm">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className={`bg-background text-foreground border-border h-11 text-sm ${
                  errors.username ? 'border-destructive' : ''
                }`}
              />
              {errors.username && (
                <p className="text-destructive text-xs mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`bg-background text-foreground border-border h-11 text-sm ${
                  errors.email ? 'border-destructive' : ''
                }`}
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-foreground text-sm">
                Referral Code <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  onChange={handleChange}
                  disabled={loading}
                  className={`bg-background text-foreground border-border h-11 text-sm pr-10 ${
                    errors.referralCode ? 'border-destructive' : 
                    referralValid === true ? 'border-green-500' : 
                    referralValid === false ? 'border-destructive' : ''
                  }`}
                />
                {validatingReferral && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!validatingReferral && referralValid === true && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {!validatingReferral && referralValid === false && formData.referralCode && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </div>
              {referralValid === true && referrerName && (
                <p className="text-green-600 text-xs mt-1">
                  Referred by: {referrerName}
                </p>
              )}
              {errors.referralCode && (
                <p className="text-destructive text-xs mt-1">
                  {errors.referralCode}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`bg-background text-foreground border-border h-11 pr-12 text-sm ${
                    errors.password ? 'border-destructive' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={`bg-background text-foreground border-border h-11 pr-12 text-sm ${
                    errors.confirmPassword ? 'border-destructive' : ''
                  }`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || validatingReferral}
              className="w-full bg-gradient-1 text-white hover:opacity-90 h-12 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
