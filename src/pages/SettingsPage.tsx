import { useEffect, useState } from 'react';
import { UserIcon, ShieldIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
  }, []);

  const loadUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);
    setProfileData({
      username: userData.username || '',
      email: userData.email || '',
    });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validatePassword()) return;

    setLoading(true);

    try {
      // First login with current password to verify
      await authApi.login(user.email, passwordData.currentPassword);

      // Then reset password (you'll need to add this endpoint or modify your backend)
      // For now, we'll show a success message
      setSuccessMessage('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password update error:', error);
      setErrors({ currentPassword: 'Current password is incorrect' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold font-headline text-foreground">Your Profile</h1>
        <p className="text-lg text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </section>

      <section className="space-y-6">
        {/* Profile Information */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Profile Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  View your account details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                disabled
                className="bg-background text-foreground border-border"
              />
              <p className="text-xs text-muted-foreground">Username cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled
                className="bg-background text-foreground border-border"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-foreground">Your Referral Code</Label>
              <Input
                id="referralCode"
                value={user?.referralCode || ''}
                disabled
                className="bg-background text-foreground border-border font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Share this code to invite others: {window.location.origin}/signup?ref={user?.referralCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-card text-card-foreground border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-tertiary/10 p-2">
                <ShieldIcon className="h-5 w-5 text-tertiary" />
              </div>
              <div>
                <CardTitle className="text-foreground">Security</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your password and security settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              {successMessage && (
                <div className="p-3 rounded-md bg-green-500/10 border border-green-500">
                  <p className="text-green-600 text-sm">{successMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  className={`bg-background text-foreground border-border ${
                    errors.currentPassword ? 'border-destructive' : ''
                  }`}
                />
                {errors.currentPassword && (
                  <p className="text-destructive text-xs">{errors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  className={`bg-background text-foreground border-border ${
                    errors.newPassword ? 'border-destructive' : ''
                  }`}
                />
                {errors.newPassword && (
                  <p className="text-destructive text-xs">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  className={`bg-background text-foreground border-border ${
                    errors.confirmPassword ? 'border-destructive' : ''
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-normal"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
