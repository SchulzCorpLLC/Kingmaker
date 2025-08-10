'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { QuestCard } from '@/components/QuestCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy, Star, TrendingUp } from 'lucide-react';
import { Quest, Profile, QuestCompletion, Database } from '@/types/supabase';

export default function Dashboard() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }

    fetchData();
  }, [session, router]);

  const fetchData = async () => {
    if (!session) return;

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData) {
        router.push('/profile-setup');
        return;
      }

      setProfile(profileData);

      // Fetch quests
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('points_value', { ascending: false });

      if (questsData) {
        setQuests(questsData);
      }

      // Fetch today's completed quests
      const today = new Date().toISOString().split('T')[0];
      const { data: completionsData } = await supabase
        .from('quest_completions')
        .select('quest_id')
        .eq('user_id', session.user.id)
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`);

      if (completionsData) {
        setCompletedQuests(new Set(completionsData.map(c => c.quest_id)));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setLoading(false);
  };

  const handleQuestComplete = (questId: string) => {
    setCompletedQuests(prev => new Set([...prev, questId]));
    // Update profile points optimistically
    if (profile) {
      const quest = quests.find(q => q.id === questId);
      if (quest) {
        setProfile(prev => prev ? {
          ...prev,
          total_points: prev.total_points + quest.points_value
        } : null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const todaysQuests = quests.slice(0, 4);
  const completedTodayCount = todaysQuests.filter(q => completedQuests.has(q.id)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.username}!
          </h1>
          <p className="text-gray-600">
            Ready to build your kingdom today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {profile.total_points}
                  </p>
                  <p className="text-sm text-gray-600">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedTodayCount}/{todaysQuests.length}
                  </p>
                  <p className="text-sm text-gray-600">Today's Quests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((completedTodayCount / todaysQuests.length) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Link href="/leaderboard">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Trophy className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      View
                    </p>
                    <p className="text-sm text-gray-600">Leaderboard</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Today's Quests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Quests</h2>
            <Link href="/quests">
              <Button variant="outline">View All Quests</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todaysQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isCompleted={completedQuests.has(quest.id)}
                onComplete={() => handleQuestComplete(quest.id)}
              />
            ))}
          </div>
        </div>

        {/* Motivational Section */}
        {profile.scripture && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Scripture</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-gray-700 italic border-l-4 border-blue-500 pl-4">
                "{profile.scripture}"
              </blockquote>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}