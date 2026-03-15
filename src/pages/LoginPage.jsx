import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    usernameOrEmail: '',
    password: '',
  });

  async function handleSubmit(event) {
    event.preventDefault();
    if (loginLoading || ssoLoading) return;

    setLoginLoading(true);
    setError('');

    try {
      await auth.loginWithPassword(form.usernameOrEmail, form.password);
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(String(loginError?.message || 'Login gagal.'));
      setLoginLoading(false);
    }
  }

  async function handleSsoLogin() {
    if (loginLoading || ssoLoading) return;
    setSsoLoading(true);
    setError('');
    try {
      await auth.loginWithSsoRedirect();
    } catch (ssoError) {
      setError(String(ssoError?.message || 'Gagal membuka login SSO.'));
      setSsoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 ocean-pattern">
      <Card className="w-full max-w-md card-ocean">
        <CardHeader>
          <CardTitle>Masuk Dashboard Patroli</CardTitle>
          <CardDescription>
            Gunakan email dan password biasa, atau lanjutkan ke login SSO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Email atau Username</Label>
              <Input
                id="usernameOrEmail"
                autoComplete="username"
                value={form.usernameOrEmail}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    usernameOrEmail: event.target.value,
                  }))
                }
                placeholder="admin.patroli@sso.local"
                disabled={loginLoading || ssoLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Masukkan password"
                disabled={loginLoading || ssoLoading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loginLoading || ssoLoading}>
              {loginLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">atau</span>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <Button variant="outline" className="w-full" onClick={handleSsoLogin} disabled={loginLoading || ssoLoading}>
            {ssoLoading ? 'Mengarahkan...' : 'Lanjutkan ke Login SSO'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Dashboard hanya menyimpan access token di memori browser. Refresh sesi tetap dijaga oleh cookie aman dari backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
