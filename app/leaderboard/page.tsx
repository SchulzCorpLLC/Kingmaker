'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Profile, Database } from '@/types/supabase';

export default function Leaderboard() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [topProfiles, setTopProfiles] = useState<Profile[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<{profile: Profile, rank: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }

    fetchLeaderboard();
  }, [session, router]);

  const fetchLeaderboard = async () => {
    if (!session) return;

    try {
      // Fetch top 10 profiles
      const { data: topData } = await supabase
        .from('profiles')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(10);

      if (topData) {
        setTopProfiles(topData);
      }

      // Get current user's rank if not in top 10
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('total_points', { ascending: false });

      if (allProfiles) {
        const currentUserIndex = allProfiles.findIndex(p => p.id === session.user.id);
        if (currentUserIndex >= 10) {
          setCurrentUserRank({
            profile: allProfiles[currentUserIndex],
            rank: currentUserIndex + 1
          });
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          <p className="text-gray-600">
            See how you rank among fellow kingdom builders
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top 10 Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Top Kingdom Builders</CardTitle>
              <CardDescription>
                The highest scoring members of our community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProfiles.map((profile, index) => (
                <LeaderboardRow
                  key={profile.id}
                  profile={profile}
                  rank={index + 1}
                  isCurrentUser={profile.id === session?.user.id}
                />
              ))}
            </CardContent>
          </Card>

          {/* Current User Position (if not in top 10) */}
          {currentUserRank && (
            <Card>
              <CardHeader>
                <CardTitle>Your Position</CardTitle>
                <CardDescription>
                  Keep pushing forward to climb the ranks!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardRow
                  profile={currentUserRank.profile}
                  rank={currentUserRank.rank}
                  isCurrentUser={true}
                />
              </CardContent>
            </Card>
          )}

          {topProfiles.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600">No rankings yet. Be the first to complete some quests!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}