import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


export const RightSidebar = ({ user}: RightSidebarProps) => {
  return (
    <aside className='right-sidebar'>
      <section className='flex flex-col pb-8'>
        <div className='profile-banner'>
          <div className='profile'>
          <div className="profile-img">
            <span className="text-5xl font-bold text-blue-600">{user.firstName[0]}</span>

          </div>
            <div className='profile-details'>
              <h1 className='text-3xl font-bold text-blue-600'>
                {user.firstName} {user.lastName}
              </h1>
              <p className='profile-email'>{user?.email ?? "Email non disponible"}</p>
            </div>
          </div>
        </div>
      </section>

      
    </aside>
  );
};
