import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { consumeSsoReturnTo } from '@/lib/authRedirect';

const AuthCallbackPage = () => {
  const { completeSsoLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const hasProcessedRef = useRef(false);
  const [callbackState, setCallbackState] = useState({
    status: 'loading',
    message: 'Memproses login SSO...',
  });

  useEffect(() => {
    if (hasProcessedRef.current) {
      return;
    }
    hasProcessedRef.current = true;

    let cancelled = false;
    const CALLBACK_TIMEOUT_MS = 10000;

    async function completeWithTimeout(code, ssoState) {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Proses login SSO terlalu lama. Silakan coba lagi.'));
        }, CALLBACK_TIMEOUT_MS);
      });

      try {
        return await Promise.race([
          completeSsoLogin(code, ssoState),
          timeoutPromise,
        ]);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    async function run() {
      const error = params.get('error');
      const code = params.get('code');
      const ssoState = params.get('state');

      if (error) {
        const errorDescription = params.get('error_description') || error;
        if (!cancelled) {
          setCallbackState({
            status: 'error',
            message: `Login SSO ditolak: ${errorDescription}`,
          });
        }
        return;
      }

      if (!code || !ssoState) {
        if (!cancelled) {
          setCallbackState({
            status: 'error',
            message: 'Code/state dari SSO tidak lengkap.',
          });
        }
        return;
      }

      try {
        await completeWithTimeout(code, ssoState);
        if (cancelled) {
          return;
        }
        navigate(consumeSsoReturnTo('/'), { replace: true });
      } catch (callbackError) {
        if (!cancelled) {
          setCallbackState({
            status: 'error',
            message: String(callbackError?.message || 'Gagal menyelesaikan login SSO.'),
          });
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [completeSsoLogin, navigate, params]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg card-ocean">
        <CardHeader>
          <CardTitle>SSO Callback</CardTitle>
          <CardDescription>Sinkronisasi sesi dari SSO ke dashboard patroli.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3">
            <p className="text-sm text-foreground">
              {callbackState.message}
            </p>
          </div>

          {callbackState.status === 'loading' ? (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/5 animate-pulse rounded-full bg-primary" />
            </div>
          ) : null}

          {callbackState.status === 'error' ? (
            <div className="flex flex-wrap gap-2">
              <Button className="btn-ocean" onClick={() => navigate('/login', { replace: true })}>
                Coba Login Lagi
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Coba Lagi
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
