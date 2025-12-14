import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle, XCircle, Clock, Star } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  skills: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  rating_tier: 'bronze' | 'silver' | 'gold' | null;
  profile_completeness: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setProfiles(data as Profile[]);
    setLoading(false);
  };

  const updateProfile = async (id: string, status: 'verified' | 'rejected', tier?: 'bronze' | 'silver' | 'gold') => {
    const update: { verification_status: 'verified' | 'rejected'; rating_tier?: 'bronze' | 'silver' | 'gold' } = { verification_status: status };
    if (tier) update.rating_tier = tier;
    
    const { error } = await supabase.from('profiles').update(update).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `Profile ${status}.` });
      fetchProfiles();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : profiles.map((profile) => (
          <Card key={profile.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{profile.full_name}</h3>
                    {profile.verification_status === 'verified' && <Badge variant="verified"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>}
                    {profile.verification_status === 'pending' && <Badge variant="pending"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}
                    {profile.verification_status === 'rejected' && <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>}
                    {profile.rating_tier && <Badge variant={profile.rating_tier} className="capitalize">{profile.rating_tier}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{profile.email}</p>
                  <div className="flex flex-wrap gap-1">{profile.skills.slice(0, 5).map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {profile.verification_status === 'pending' && (
                    <>
                      <div className="flex gap-1">
                        {(['bronze', 'silver', 'gold'] as const).map(tier => (
                          <Button key={tier} size="sm" variant="outline" onClick={() => updateProfile(profile.id, 'verified', tier)}>
                            <Star className="h-3 w-3 mr-1" />{tier}
                          </Button>
                        ))}
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => updateProfile(profile.id, 'rejected')}>
                        <XCircle className="h-3 w-3 mr-1" />Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
