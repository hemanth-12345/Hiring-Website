import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Check, X, Clock } from 'lucide-react';

interface ContactRequest {
  id: string;
  employer_id: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function ContactRequestsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .eq('candidate_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) setRequests(data as ContactRequest[]);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('contact_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update request.', variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: `Request ${status}.` });
      fetchRequests();
    }
  };

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Contact Requests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Employer Request</p>
              {req.message && <p className="text-xs text-muted-foreground">{req.message}</p>}
            </div>
            {req.status === 'pending' ? (
              <div className="flex gap-2">
                <Button size="sm" variant="default" onClick={() => updateStatus(req.id, 'approved')}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'rejected')}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Badge variant={req.status === 'approved' ? 'verified' : 'destructive'}>
                {req.status}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
