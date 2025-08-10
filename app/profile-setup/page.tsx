'use client';

import { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Database } from '@/types/supabase';

export default function ProfileSetup() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

    // Check if profile already exists
    const checkProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        router.push('/dashboard');
      }
    };

    checkProfile();
  }, [session, supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: session.user.id,
          username: formData.username,
          bio: formData.bio,
          business_focus: formData.business_focus,
          scripture: formData.scripture,
        },
      ]);

    if (error) {
      console.error('Error creating profile:', error);
    } else {
      router.push('/dashboard');
    }

    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Kingmaker</CardTitle>
          <CardDescription>
            Let's set up your profile to get started on your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="business_focus">Business Focus</Label>
              <Input
                id="business_focus"
                placeholder="e.g., Real Estate, E-commerce, Consulting"
                value={formData.business_focus}
                onChange={(e) => handleChange('business_focus', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your mission"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="scripture">Favorite Scripture</Label>
              <Textarea
                id="scripture"
                placeholder="Share a scripture verse that inspires you"
                value={formData.scripture}
                onChange={(e) => handleChange('scripture', e.target.value)}
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}