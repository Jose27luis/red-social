'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { resourcesApi } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import UploadResource from '@/components/resources/UploadResource';
import ResourceCard from '@/components/resources/ResourceCard';
import { Resource, ResourceType } from '@/types';

const RESOURCE_TYPES = [
  { value: 'all', label: 'Todos' },
  { value: ResourceType.DOCUMENT, label: 'Documentos' },
  { value: ResourceType.PRESENTATION, label: 'Presentaciones' },
  { value: ResourceType.SPREADSHEET, label: 'Hojas de Cálculo' },
  { value: ResourceType.VIDEO, label: 'Videos' },
  { value: ResourceType.AUDIO, label: 'Audio' },
  { value: ResourceType.IMAGE, label: 'Imágenes' },
  { value: ResourceType.CODE, label: 'Código' },
  { value: ResourceType.OTHER, label: 'Otros' },
];

export default function ResourcesPage() {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.RESOURCES,
    queryFn: () => resourcesApi.getAll(),
  });

  const resources = data?.data?.data || [];

  // Filter resources
  const filteredResources = resources.filter((resource: Resource) => {
    const matchesType = filter === 'all' || resource.fileType === filter;
    const matchesSearch = searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          Error al cargar los recursos. Por favor intenta de nuevo.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recursos Compartidos</h1>
      </div>

      <UploadResource />

      {/* Search Bar */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar recursos..."
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {RESOURCE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === type.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No se encontraron recursos que coincidan con tu búsqueda.'
                : filter === 'all'
                ? 'No hay recursos aún. ¡Sube el primero!'
                : `No hay recursos de tipo "${RESOURCE_TYPES.find(t => t.value === filter)?.label}".`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResources.map((resource: Resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
