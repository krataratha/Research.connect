import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Users, FileSpreadsheet, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';

const Home = () => {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center max-w-4xl mx-auto py-12 px-4 gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-brand-light-purple)] text-[var(--color-brand-indigo)] border border-purple-200/50 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5" />
          Connecting Global Minds
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight text-[var(--color-brand-text-primary)] leading-tight">
          Where Scientific Discovery Meets <span className="text-gradient">Collaboration</span>
        </h1>

        <p className="text-base sm:text-xl text-[var(--color-brand-text-secondary)] font-sans max-w-2xl">
          ResearchConnect is a production platform designed for researchers, academics, and sponsors to co-author publications, coordinate research projects, and build open-science communities.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a href="#discover">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Publications
            </Button>
          </a>
        </div>
      </section>

      {/* Grid of Key Platform Modules */}
      <section id="discover" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card 
          title="Researcher Profiles" 
          subtitle="Identity & ORCID Integration"
          headerAction={
            <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-light-blue)] flex items-center justify-center text-[var(--color-brand-blue)]">
              <Users className="w-5 h-5" />
            </div>
          }
        >
          <p className="mb-4">
            Build verified researcher profiles detailing your academic history, institutional affiliations, published studies, and core scientific skills.
          </p>
          <Link to="/login" className="text-xs font-bold text-[var(--color-brand-blue)] hover:underline inline-flex items-center gap-1">
            Setup profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card 
          title="Collaborative Projects" 
          subtitle="Realtime Workspace Coordination"
          headerAction={
            <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-light-purple)] flex items-center justify-center text-[var(--color-brand-indigo)]">
              <Compass className="w-5 h-5" />
            </div>
          }
        >
          <p className="mb-4">
            Form cross-institutional research groups. Track milestones, share datasets, delegate tasks, and coordinate preprints securely.
          </p>
          <Link to="/login" className="text-xs font-bold text-[var(--color-brand-indigo)] hover:underline inline-flex items-center gap-1">
            Launch project <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card 
          title="Verified Publications" 
          subtitle="Open-Science Repository"
          headerAction={
            <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-light-green)] flex items-center justify-center text-[var(--color-brand-success)]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          }
        >
          <p className="mb-4">
            Index academic articles, peer-reviews, and preprints. Maintain DOI mappings, track citations, and bookmark articles to your personal library.
          </p>
          <Link to="/login" className="text-xs font-bold text-[var(--color-brand-success)] hover:underline inline-flex items-center gap-1">
            Browse library <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </section>

      {/* Platform Architecture Cues */}
      <section className="glass-card rounded-2xl p-8 border border-[var(--color-brand-border)] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl text-left">
          <span className="text-xs font-bold text-[var(--color-brand-indigo)] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Enterprise Security
          </span>
          <h2 className="text-2xl font-bold font-display text-[var(--color-brand-text-primary)]">
            Engineered for Academic Integrity
          </h2>
          <p className="text-[var(--color-brand-text-secondary)] font-sans">
            ResearchConnect operates on top of secure database models validating credentials, ORCID affiliations, and collaboration invites, ensuring that scientific data and contributions remain protected.
          </p>
        </div>
        <Link to="/register" className="flex-shrink-0 w-full md:w-auto">
          <Button size="lg" className="w-full">
            Join the Network
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
