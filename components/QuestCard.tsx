'use client';

import { useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Star } from 'lucide-react';
import { Quest, Database } from '@/types/supabase';

interface QuestCardProps {
  quest: Quest;
  isCompleted: boolean;
  onComplete: () => void;
}

export function QuestCard({ quest, isCompleted, onComplete }: QuestCardProps) {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!session || isCompleted) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('quest_completions')
        .insert([
          {
            quest_id: quest.id,
            user_id: session.user.id,
          },
        ]);

      if (error) {
        console.error('Error completing quest:', error);
      } else {
        // Optimistic update
        onComplete();
      }
    } catch (error) {
      console.error('Error completing quest:', error);
    }

    setLoading(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'spiritual':
        return 'bg-purple-100 text-purple-800';
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'health':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
              {quest.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getCategoryColor(quest.category)}>
                {quest.category}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-yellow-600">
                <Star className="w-4 h-4 fill-current" />
                {quest.points_value} pts
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {quest.description}
        </CardDescription>
        <Button
          onClick={handleComplete}
          disabled={loading || isCompleted}
          className={`w-full ${
            isCompleted
              ? 'bg-green-600 hover:bg-green-600'
              : ''
          }`}
        >
          {loading ? 'Completing...' : isCompleted ? 'Completed!' : 'Complete Quest'}
        </Button>
      </CardContent>
    </Card>
  );
}