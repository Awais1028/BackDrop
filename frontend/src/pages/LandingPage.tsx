import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { PlayCircle, Zap, Film } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-white/10">
        <Link to="/" className="flex items-center justify-center">
          <Film className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">BackDrop</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-slate-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Finance Your Next Production, Before You Roll Camera
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    BackDrop is the marketplace connecting creators with brands for pre-production sponsorships. Secure funding, streamline deals, and bring your vision to life.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to="/login">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Get Started</Button>
                  </Link>
                  <Link to="#">
                    <Button variant="outline" size="lg">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <img
                src="/placeholder.svg"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square opacity-80"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">A Better Way to Fund Content</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform provides the tools for creators and brands to build powerful partnerships from the script up.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-colors">
                <Zap className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Programmatic-like Marketplace</h3>
                <p className="text-muted-foreground">Discover and bid on in-content sponsorship slots efficiently and at scale.</p>
              </div>
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-colors">
                <Film className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Predictable Revenue</h3>
                <p className="text-muted-foreground">Creators can secure upfront revenue for pre-production content, ensuring predictability.</p>
              </div>
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-colors">
                <PlayCircle className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-xl font-bold">Streamlined Workflow</h3>
                <p className="text-muted-foreground">From script upload to deal memo generation, manage the entire process in one place.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center p-4 border-t border-white/10">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default LandingPage;