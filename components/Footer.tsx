'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import Image from 'next/image';
import { logoutAccount } from '@/lib/actions/user.actions';

export const Footer = ({ user, type = 'desktop' }: FooterProps) => {
  const router = useRouter();

  const handleLogOut = async () => {
    await logoutAccount();
    router.push('/sign-in'); 
  };

  return (
    <footer className="footer">
      <div className={type === 'mobile' ? 'footer_name-mobile' : 'footer_name'}>
        <p className="text-xl font-bold text-gray-700">{/* اسمك هنا */}</p>
      </div>
      <div className={type === 'mobile' ? 'footer_email-mobile' : 'footer_email'}>
        <h1 className="text-14 truncate text-gray-700 font-semibold">{user?.name}</h1>
        <p className="text-14 truncate font-normal text-gray-600">{user?.email}</p>
      </div>
      <div className="footer-image" onClick={handleLogOut}>
        <Image src="/icons/logout.svg" alt="Logout" width={24} height={24} />
      </div>
    </footer>
  );
};

export default Footer;
