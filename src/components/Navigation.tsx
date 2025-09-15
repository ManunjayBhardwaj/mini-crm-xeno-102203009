'use client';

import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Customers', href: '/customers' },
    { name: 'Campaigns', href: '/campaigns' },
    { name: 'Analytics', href: '/analytics' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">Xeno CRM</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || ''}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-gray-700">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
