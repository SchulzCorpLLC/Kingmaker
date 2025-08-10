'use client';

import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Auth } from '@/components/Auth';

export default function Home() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirecting to dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Kingmaker
          </h1>
          <p className="text-xl text-blue-200 mb-8">
            Gamified accountability and business growth for men of faith
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Auth />
        </div>
        
        <div className="mt-16 text-center text-blue-200">
          <h2 className="text-2xl font-bold mb-6">Build Your Kingdom</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Daily Quests</h3>
              <p className="text-sm">Complete spiritual, business, and personal challenges to earn points and grow.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Leaderboard</h3>
              <p className="text-sm">Compete with like-minded men and climb the ranks through consistent action.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Community</h3>
              <p className="text-sm">Connect with other men of faith building their business and spiritual kingdom.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}