'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Medal, Award } from 'lucide-react';
import { Profile } from '@/types/supabase';

interface LeaderboardRowProps {
  profile: Profile;
  rank: number;
  isCurrentUser: boolean;
}

export function LeaderboardRow({ profile, rank, isCurrentUser }: LeaderboardRowProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    return isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white';
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${getRankStyle(rank)}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-[3rem]">
          {getRankIcon(rank)}
          <span className="text-lg font-bold text-gray-700">#{rank}</span>
        </div>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={profile.avatar_url || ''} />
          <AvatarFallback>
            {profile.username ? profile.username.slice(0, 2).toUpperCase() : 'UN'}
          </AvatarFallback>
        </Avatar>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {profile.username || 'Anonymous'}
            </h3>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs">
                You
              </Badge>
            )}
          </div>
          {profile.business_focus && (
            <p className="text-sm text-gray-600 truncate">
              {profile.business_focus}
            </p>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900">
          {profile.total_points}
        </div>
        <div className="text-xs text-gray-500">points</div>
      </div>
    </div>
  );
}