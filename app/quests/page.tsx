'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { QuestCard } from '@/components/QuestCard';
import { Badge } from '@/components/ui/badge';
import { Quest, QuestCompletion, Database } from '@/types/supabase';

export default function Quests() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      // Fetch quests
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

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
  };

  const categories = ['all', ...Array.from(new Set(quests.map(q => q.category)))];
  const filteredQuests = selectedCategory === 'all' 
    ? quests 
    : quests.filter(q => q.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'spiritual':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'business':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'health':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'personal':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading quests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Daily Quests</h1>
          <p className="text-gray-600 mb-6">
            Complete quests to earn points and build your kingdom. Each quest can be completed once per day.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : category === 'all'
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    : getCategoryColor(category)
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Quests' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              isCompleted={completedQuests.has(quest.id)}
              onComplete={() => handleQuestComplete(quest.id)}
            />
          ))}
        </div>

        {filteredQuests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No quests found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}