import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { rememberSsoReturnTo } from '@/lib/authRedirect';

const LoginPage = () => {
  const auth = useAuth();
  const location = useLocation();
  const hasStartedRef = useRef(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSsoLogin = useCallback(async () => {
    if (ssoLoading) return;
    setSsoLoading(true);
    setError('');

    rememberSsoReturnTo(location.state?.from || '/');

    try {
      await auth.loginWithSsoRedirect();
    } catch (ssoError) {
      setError(String(ssoError?.message || 'Gagal membuka login SSO.'));
      setSsoLoading(false);
    }
  }, [auth, location.state, ssoLoading]);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    handleSsoLogin();
  }, [handleSsoLogin]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 ocean-pattern">
      <Card className="w-full max-w-md card-ocean">
        <CardHeader>
          <CardTitle>Masuk Dashboard Patroli</CardTitle>
          <CardDescription>
            Autentikasi dashboard patroli dipusatkan di SIJALA SSO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm text-foreground">
            {ssoLoading
              ? 'Anda sedang diarahkan ke form login SSO...'
              : 'Klik tombol di bawah jika browser tidak otomatis mengalihkan Anda ke SSO.'}
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <Button className="w-full" onClick={handleSsoLogin} disabled={ssoLoading}>
            {ssoLoading ? 'Mengarahkan...' : 'Lanjutkan ke Login SSO'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Jika sesi SSO masih aktif, Anda akan langsung kembali ke dashboard tanpa mengisi ulang password.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
