'use client';

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Profile, Database } from '@/types/supabase';

export default function ProfilePage() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    business_focus: '',
    scripture: '',
  });

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }

    fetchProfile();
  }, [session, router]);

  const fetchProfile = async () => {
    if (!session) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || '',
          bio: data.bio || '',
          business_focus: data.business_focus || '',
          scripture: data.scripture || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          bio: formData.bio,
          business_focus: formData.business_focus,
          scripture: formData.scripture,
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        setIsEditing(false);
        fetchProfile(); // Refresh profile data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }

    setSaving(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback>
                      {profile.username ? profile.username.slice(0, 2).toUpperCase() : 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{profile.username || 'Anonymous'}</CardTitle>
                    <CardDescription>Member since {new Date(profile.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{profile.total_points}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
              </div>
            </CardHeader>
            
            {isEditing ? (
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="business_focus">Business Focus</Label>
                    <Input
                      id="business_focus"
                      value={formData.business_focus}
                      onChange={(e) => handleChange('business_focus', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="scripture">Favorite Scripture</Label>
                    <Textarea
                      id="scripture"
                      value={formData.scripture}
                      onChange={(e) => handleChange('scripture', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: profile.username || '',
                          bio: profile.bio || '',
                          business_focus: profile.business_focus || '',
                          scripture: profile.scripture || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            ) : (
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Business Focus</Label>
                  <p className="text-gray-900">{profile.business_focus || 'Not specified'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Bio</Label>
                  <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Favorite Scripture</Label>
                  <blockquote className="text-gray-900 italic border-l-4 border-blue-500 pl-4 mt-2">
                    {profile.scripture || 'No scripture shared'}
                  </blockquote>
                </div>

                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}