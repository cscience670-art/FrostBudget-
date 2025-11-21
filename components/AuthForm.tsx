'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/actions/user.actions';
import ClientInput from './ClientInput';

const AuthForm = ({ type }: { type: 'sign-in' | 'sign-up' }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setServerError(null);

    try {
      if (type === 'sign-up') {
        const res = await signUp({
          username: data.username!,
          firstName: data.firstName!,
          lastName: data.lastName!,
          email: data.email,
          password: data.password,
        });

        if (res?.error) {
          setServerError(res.error);
          return;
        }

        if (res?.success) {
          router.push('/Category');
          return;
        }
      }

      if (type === 'sign-in') {
        const res = await signIn({
          email: data.email,
          password: data.password,
        });

        if (res?.error) {
          setServerError(res.error);
          return;
        }

        if (res?.success) {
          router.push('/');
          return;
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setServerError('Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-form">
      {/* Logo & Header */}
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer flex items-center ">
          <Image
            src="/icons/logo2DB.png"
            width={250}
            height={220}
            alt=" logo"
          />
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {type === 'sign-in' ? 'Sign In' : 'Create an Account'}
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {type === 'sign-in'
              ? 'Log in to your account'
              : 'Enter your details to create your account'}
          </p>
        </div>
      </header>

      {/* Error Message */}
      {serverError && (
        <p className="text-red-500 text-sm mb-2">
          {serverError}
        </p>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {type === 'sign-up' && (
            <>
              <ClientInput
                control={form.control}
                name="username"
                label="Username"
                placeholder="Enter your username"
              />
              <div className="flex gap-4">
                <ClientInput
                  control={form.control}
                  name="firstName"
                  label="First Name"
                  placeholder="Enter your first name"
                />
                <ClientInput
                  control={form.control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter your last name"
                />
              </div>
            </>
          )}

          <ClientInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter your email"
          />
          <ClientInput
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
          />

          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
              </>
            ) : type === 'sign-in' ? (
              'Sign In'
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
      </Form>

      {/* Footer */}
      <footer className="flex justify-center gap-1 mt-4">
        <p className="text-14 font-normal text-gray-600">
          {type === 'sign-in'
            ? "Don't have an account?"
            : 'Already have an account?'}
        </p>
        <Link
          href={type === 'sign-in' ? '/sign-up' : '/sign-in'}
          className="form-link"
        >
          {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
        </Link>
      </footer>
    </section>
  );
};

export default AuthForm;

