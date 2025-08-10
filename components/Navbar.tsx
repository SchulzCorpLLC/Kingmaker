'use client';

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Target, 
  Trophy, 
  User, 
  LogOut,
  Crown
} from 'lucide-react';
import { Database } from '@/types/supabase';

export function Navbar() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!session) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/quests', label: 'Quests', icon: Target },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Crown className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">Kingmaker</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t py-3">
          <div className="flex justify-between">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center px-3 py-2 rounded-md text-xs transition-colors ${
                  pathname === href
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}