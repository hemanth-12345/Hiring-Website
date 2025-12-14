import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, CheckCircle, Github, Linkedin, Globe, Send } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  location: string | null;
  skills: string[];
  experience_years: number;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  rating_tier: 'bronze' | 'silver' | 'gold' | null;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProfiles();
    fetchSentRequests();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, location, skills, experience_years, github_url, linkedin_url, portfolio_url, rating_tier')
      .eq('verification_status', 'verified');
    
    if (data) setProfiles(data as Profile[]);
    setLoading(false);
  };

  const fetchSentRequests = async () => {
    const { data } = await supabase
      .from('contact_requests')
      .select('candidate_id')
      .eq('employer_id', user?.id);
    
    if (data) setSentRequests(new Set(data.map(r => r.candidate_id)));
  };

  const sendRequest = async (candidateId: string) => {
    const { error } = await supabase
      .from('contact_requests')
      .insert({ employer_id: user?.id, candidate_id: candidateId });

    if (error) {
      toast({ title: 'Error', description: 'Failed to send request.', variant: 'destructive' });
    } else {
      toast({ title: 'Sent!', description: 'Contact request sent to candidate.' });
      setSentRequests(prev => new Set([...prev, candidateId]));
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return p.full_name.toLowerCase().includes(query) ||
      p.skills.some(s => s.toLowerCase().includes(query)) ||
      p.location?.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-heading font-bold">Find Talent</h1>
        <p className="text-muted-foreground">Search verified candidates using natural language</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, skills, or location..."
          className="pl-12 h-14 text-lg"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : filteredProfiles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No verified candidates found.</p>
        ) : (
          filteredProfiles.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-heading font-semibold text-lg">{profile.full_name}</h3>
                      <Badge variant="verified" className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </Badge>
                      {profile.rating_tier && (
                        <Badge variant={profile.rating_tier} className="capitalize">{profile.rating_tier}</Badge>
                      )}
                    </div>
                    {profile.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                        <MapPin className="h-3 w-3" /> {profile.location}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {profile.skills.slice(0, 6).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {profile.github_url && <a href={profile.github_url} target="_blank" className="text-muted-foreground hover:text-primary"><Github className="h-4 w-4" /></a>}
                      {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" className="text-muted-foreground hover:text-primary"><Linkedin className="h-4 w-4" /></a>}
                      {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" className="text-muted-foreground hover:text-primary"><Globe className="h-4 w-4" /></a>}
                    </div>
                  </div>
                  <Button
                    onClick={() => sendRequest(profile.user_id)}
                    disabled={sentRequests.has(profile.user_id)}
                    variant={sentRequests.has(profile.user_id) ? 'outline' : 'hero'}
                  >
                    <Send className="h-4 w-4" />
                    {sentRequests.has(profile.user_id) ? 'Requested' : 'Contact'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
