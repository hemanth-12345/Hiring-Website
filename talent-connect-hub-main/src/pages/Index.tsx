import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Shield, Users, Briefcase, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function Index() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role) {
      navigate('/dashboard');
    }
  }, [user, role, loading, navigate]);

  const features = [
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Every candidate is manually reviewed and rated by our admin team.',
    },
    {
      icon: Search,
      title: 'Natural Language Search',
      description: 'Find talent using plain English. No complex filters needed.',
    },
    {
      icon: Star,
      title: 'Trust Ratings',
      description: 'Bronze, Silver, and Gold tiers help you identify top talent.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">TalentTrust</span>
          </div>
          <Button variant="hero" onClick={() => navigate('/auth')}>
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <CheckCircle className="h-4 w-4" />
              Trusted by 500+ companies
            </div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
              Find <span className="text-gradient-primary">Verified Talent</span>
              <br />You Can Trust
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A talent discovery platform where every profile is manually verified. 
              Search naturally, hire confidently.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" variant="hero" onClick={() => navigate('/auth')}>
                <Users className="h-5 w-5" />
                I'm Looking for Work
              </Button>
              <Button size="xl" variant="outline" onClick={() => navigate('/auth')}>
                <Briefcase className="h-5 w-5" />
                I'm Hiring
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              Why TalentTrust?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We eliminate spam, simplify search, and build trust between talent and employers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create Profile', desc: 'Candidates build detailed profiles with skills, experience, and portfolio links.' },
              { step: '02', title: 'Get Verified', desc: 'Our admin team reviews and rates each profile for authenticity and quality.' },
              { step: '03', title: 'Get Discovered', desc: 'Employers search naturally and send contact requests to verified candidates.' },
            ].map((item, index) => (
              <div key={item.step} className="text-center animate-fade-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="text-5xl font-heading font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of verified professionals and trusted employers on TalentTrust.
          </p>
          <Button size="xl" variant="accent" onClick={() => navigate('/auth')}>
            Create Your Account
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2024 TalentTrust. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
