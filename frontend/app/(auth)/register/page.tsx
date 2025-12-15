'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/store/useAuthStore';
import { ApiError, UserRole } from '@/types';
import { UNIVERSIDAD_DOMAIN, PASSWORD_REGEX } from '@/lib/constants';

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  email: z
    .string()
    .email('Email inválido')
    .refine((email) => email.endsWith(UNIVERSIDAD_DOMAIN), {
      message: `El email debe terminar en ${UNIVERSIDAD_DOMAIN}`,
    }),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      PASSWORD_REGEX,
      'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'
    ),
  role: z.nativeEnum(UserRole),
  department: z.string().max(100).optional(),
  career: z.string().max(100).optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.STUDENT,
    },
  });

  const selectedRole = watch('role');

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => authApi.register(data),
    onSuccess: (response) => {
      setAuth(response.data);
      router.push('/feed');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al registrarse';
      setError(message);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError('');
    registerMutation.mutate(data);
  };

  return (
    <Card className="shadow-lg my-8">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Crear Cuenta
        </CardTitle>
        <CardDescription className="text-center">
          Únete a la red académica de UNAMAD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Apellido
              </label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Institucional
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@unamad.edu.pe"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres: mayúscula, minúscula, número y carácter especial
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Rol
            </label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.STUDENT}>Estudiante</SelectItem>
                <SelectItem value={UserRole.PROFESSOR}>Profesor</SelectItem>
                <SelectItem value={UserRole.ALUMNI}>Egresado</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium">
              Departamento (Opcional)
            </label>
            <Input
              id="department"
              {...register('department')}
              placeholder="Ej: Facultad de Educación"
            />
            {errors.department && (
              <p className="text-sm text-destructive">{errors.department.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="career" className="text-sm font-medium">
              Carrera (Opcional)
            </label>
            <Input
              id="career"
              {...register('career')}
              placeholder="Ej: Ingeniería de Sistemas"
            />
            {errors.career && (
              <p className="text-sm text-destructive">{errors.career.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Registrando...' : 'Crear Cuenta'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
