'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSwapped, setIsSwapped] = useState(false);

  return (
    <div className="min-h-screen flex relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsSwapped(!isSwapped)}
        className={`absolute top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-500 hover:scale-110 ${
          isSwapped
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-foreground border'
        }`}
        aria-label="Cambiar tema"
      >
        {isSwapped ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>

      {/* Left side - Image */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative items-start justify-center transition-all duration-500 ${
          isSwapped ? 'bg-background' : 'bg-primary'
        }`}
      >
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isSwapped
              ? 'bg-gradient-to-br from-background to-muted'
              : 'bg-gradient-to-br from-primary/90 to-primary'
          }`}
        />
        <div className="relative z-10 flex flex-col items-center justify-start p-12 pt-24 text-center">
          <div
            className={`rounded-full p-6 shadow-2xl mb-8 transition-all duration-500 ${
              isSwapped ? 'bg-primary' : 'bg-white'
            }`}
          >
            <Image
              src="/images/logounamad.png"
              alt="Logo UNAMAD"
              width={150}
              height={150}
              className="object-contain"
              priority
            />
          </div>
          <h1
            className={`text-4xl font-bold mb-4 transition-all duration-500 ${
              isSwapped ? 'text-foreground' : 'text-primary-foreground'
            }`}
          >
            Red Académica UNAMAD
          </h1>
          <p
            className={`text-xl max-w-md transition-all duration-500 ${
              isSwapped ? 'text-muted-foreground' : 'text-primary-foreground/80'
            }`}
          >
            Conectamos a estudiantes, profesores y egresados de la Universidad Nacional Amazónica de Madre de Dios
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 transition-all duration-500 ${
          isSwapped ? 'bg-primary' : 'bg-background'
        }`}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div
              className={`rounded-full p-4 transition-all duration-500 ${
                isSwapped ? 'bg-white/20' : 'bg-primary/10'
              }`}
            >
              <Image
                src="/images/logounamad.png"
                alt="Logo UNAMAD"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className={isSwapped ? '[&_*]:text-primary-foreground [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input::placeholder]:text-white/50' : ''}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
