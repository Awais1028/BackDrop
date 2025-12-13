import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { PlayCircle, Zap, Film } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link to="/" className="flex items-center justify-center">
          <Film className="h-6 w-6 text-purple-600" />
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">BackDrop</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/login">
            <Button>Sign Up</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900 dark:text-white">
                    Finance Your Next Production, Before You Roll Camera
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    BackDrop is the marketplace connecting creators with brands for pre-production sponsorships. Secure funding, streamline deals, and bring your vision to life.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to="/login">
                    <Button size="lg">Get Started</Button>
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
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900 dark:text-white">A Better Way to Fund Content</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform provides the tools for creators and brands to build powerful partnerships from the script up.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <Zap className="h-10 w-10 mx-auto text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Programmatic-like Marketplace</h3>
                <p className="text-gray-500 dark:text-gray-400">Discover and bid on in-content sponsorship slots efficiently and at scale.</p>
              </div>
              <div className="grid gap-1 text-center">
                <Film className="h-10 w-10 mx-auto text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Predictable Revenue</h3>
                <p className="text-gray-500 dark:text-gray-400">Creators can secure upfront revenue for pre-production content, ensuring predictability.</p>
              </div>
              <div className="grid gap-1 text-center">
                <PlayCircle className="h-10 w-10 mx-auto text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Streamlined Workflow</h3>
                <p className="text-gray-500 dark:text-gray-400">From script upload to deal memo generation, manage the entire process in one place.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center p-4 border-t">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default LandingPage;