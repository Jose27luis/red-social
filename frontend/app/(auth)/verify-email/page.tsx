'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { authApi } from '@/lib/api/endpoints';
import { ApiError } from '@/types';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyMutation = useMutation({
    mutationFn: (verificationToken: string) => authApi.verifyEmail(verificationToken),
    onSuccess: () => {
      setStatus('success');
    },
    onError: (error: AxiosError<ApiError>) => {
      setStatus('error');
      const message = error.response?.data?.message || 'Error al verificar el email';
      setErrorMessage(typeof message === 'string' ? message : message[0]);
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    verifyMutation.mutate(token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verificando tu cuenta</CardTitle>
              <CardDescription>
                Por favor espera mientras verificamos tu correo electrónico...
              </CardDescription>
            </CardHeader>
          </>
        );

      case 'success':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                ¡Cuenta verificada!
              </CardTitle>
              <CardDescription>
                Tu correo electrónico ha sido verificado exitosamente. Ya puedes iniciar sesión en tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => router.push('/login')} className="w-full max-w-xs">
                Iniciar Sesión
              </Button>
            </CardFooter>
          </>
        );

      case 'error':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                Error de verificación
              </CardTitle>
              <CardDescription>
                {errorMessage || 'El enlace de verificación es inválido o ha expirado.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              <p>Si necesitas un nuevo enlace de verificación, puedes solicitarlo desde la página de inicio de sesión.</p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/login')}>
                Ir al Login
              </Button>
              <Button variant="outline" onClick={() => router.push('/register')}>
                Registrarse
              </Button>
            </CardFooter>
          </>
        );

      case 'no-token':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Mail className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-2xl">Verificación de Email</CardTitle>
              <CardDescription>
                No se proporcionó un token de verificación. Por favor usa el enlace enviado a tu correo electrónico.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/login">
                <Button variant="outline">Ir al Login</Button>
              </Link>
            </CardFooter>
          </>
        );
    }
  };

  return (
    <Card className="shadow-lg border-0 lg:shadow-none lg:bg-transparent">
      {renderContent()}
    </Card>
  );
}
