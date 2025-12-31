'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api/axios';
import {
  Shield,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface AccessLog {
  id: string;
  ipAddress: string;
  userAgent: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  success: boolean;
  failReason: string | null;
  createdAt: string;
}

interface AccessLogsResponse {
  data: AccessLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface FailedAttemptsResponse {
  failedAttempts: number;
  period: string;
}

const getDeviceIcon = (device: string | null) => {
  switch (device?.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-5 w-5" />;
    case 'tablet':
      return <Tablet className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
};

const getBrowserColor = (browser: string | null) => {
  switch (browser?.toLowerCase()) {
    case 'chrome':
      return 'text-yellow-500';
    case 'firefox':
      return 'text-orange-500';
    case 'safari':
      return 'text-blue-500';
    case 'edge':
      return 'text-cyan-500';
    default:
      return 'text-gray-500';
  }
};

export default function SecurityPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch access logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['access-logs', page],
    queryFn: async () => {
      const response = await api.get<AccessLogsResponse>(`/access-logs?page=${page}&limit=${limit}`);
      return response.data;
    },
  });

  // Fetch failed attempts count
  const { data: failedData } = useQuery({
    queryKey: ['failed-attempts'],
    queryFn: async () => {
      const response = await api.get<FailedAttemptsResponse>('/access-logs/failed-attempts');
      return response.data;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const logs = logsData?.data || [];
  const meta = logsData?.meta;
  const failedAttempts = failedData?.failedAttempts || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Seguridad</h1>
          <p className="text-muted-foreground">Historial de accesos a tu cuenta</p>
        </div>
      </div>

      {/* Security Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{meta?.total || 0}</p>
              <p className="text-sm text-muted-foreground">Accesos totales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full ${failedAttempts > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              {failedAttempts > 0 ? (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold">{failedAttempts}</p>
              <p className="text-sm text-muted-foreground">Intentos fallidos (24h)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {logs[0] ? formatDate(logs[0].createdAt).split(',')[0] : '-'}
              </p>
              <p className="text-sm text-muted-foreground">Último acceso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Historial de Accesos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div role="status" aria-live="polite" className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
              <p className="text-muted-foreground">No hay registros de acceso aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                    !log.success ? 'border-red-500/50 bg-red-500/5' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full ${log.success ? 'bg-muted' : 'bg-red-500/10'}`}>
                    {getDeviceIcon(log.device)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${getBrowserColor(log.browser)}`}>
                        {log.browser || 'Navegador desconocido'}
                      </span>
                      <span className="text-muted-foreground">en</span>
                      <span className="font-medium">{log.os || 'SO desconocido'}</span>
                      {!log.success && (
                        <span className="flex items-center gap-1 text-red-500 text-sm">
                          <XCircle className="h-4 w-4" />
                          Fallido
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {log.city && log.country ? `${log.city}, ${log.country}` : log.ipAddress}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    {log.failReason && (
                      <p className="text-sm text-red-500 mt-1">{log.failReason}</p>
                    )}
                  </div>

                  <div className="text-right text-sm text-muted-foreground hidden md:block">
                    <p>{log.ipAddress}</p>
                    <p className="text-xs">{log.device}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} de {meta.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Página {page} de {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
