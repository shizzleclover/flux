'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  EyeOff,
  User,
  Users,
  Shuffle,
  Zap,
} from 'lucide-react';

export default function Home() {
  const [onlineCount, setOnlineCount] = useState(847);
  const [chatsToday, setChatsToday] = useState(12400);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
      setChatsToday(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#E0F6FF] text-[#131113] overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-24 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3370ff] text-white text-xs font-semibold rounded-full mb-8 uppercase tracking-wider">
            <span className="w-2 h-2 bg-white rounded-full" />
            Random Video Chat for Students
          </div>

          {/* Headline */}
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#131113] mb-8 leading-[1.1] tracking-tight" 
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Meet strangers
            <br />
            <span className="text-[#3370ff]">from your campus</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[#495049] mb-12 max-w-2xl mx-auto leading-relaxed">
            Anonymous video chats with other students. Skip the awkward, find your people.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/chat"
              className="px-10 py-4 bg-[#3370ff] hover:bg-[#004cff] text-white font-bold rounded-lg text-lg transition-colors inline-flex items-center gap-2"
            >
              Start Chatting
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/groups"
              className="px-10 py-4 bg-white border-2 border-[#3370ff] hover:border-[#004cff] text-[#3370ff] font-semibold rounded-lg text-lg transition-colors"
            >
              Browse Rooms
            </Link>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-[#495049] text-sm">
            <EyeOff className="w-4 h-4" />
            <span>100% Anonymous • No Sign Up Required</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="py-6 bg-[#fcba03] text-[#131113] border-y-2 border-[#B0E0E6]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#de212e] rounded-full" />
              <span>{onlineCount.toLocaleString()} students online</span>
            </div>
            <div className="hidden md:block w-1 h-1 bg-[#131113] rounded-full" />
            <span>{chatsToday.toLocaleString()}+ chats today</span>
            <div className="hidden md:block w-1 h-1 bg-[#131113] rounded-full" />
            <span>100+ campuses</span>
          </div>
        </div>
      </div>

      {/* Mode Selection Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#131113] mb-4" 
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              How do you want to chat?
            </h2>
            <p className="text-lg text-[#495049]">Choose your vibe</p>
          </div>

          {/* Mode Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* One-on-One Card */}
            <Link
              href="/chat"
              className="group block bg-white border-2 border-[#3370ff] rounded-2xl p-10 hover:border-[#004cff] transition-all shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-[#3370ff] rounded-xl flex items-center justify-center mb-6 mx-auto">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 
                className="text-2xl font-bold text-[#131113] mb-3" 
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                One-on-One
              </h3>
              <p className="text-[#495049] mb-6 leading-relaxed">
                Get matched instantly with a random student for a private video chat.
              </p>
              <div className="flex items-center justify-center gap-2 text-[#3370ff] font-semibold">
                <span>Start Chat</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Group Rooms Card */}
            <Link
              href="/groups"
              className="group block bg-white border-2 border-[#de212e] rounded-2xl p-10 hover:border-[#b11b25] transition-all shadow-lg text-center"
            >
              <div className="w-16 h-16 bg-[#de212e] rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 
                className="text-2xl font-bold text-[#131113] mb-3" 
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Group Rooms
              </h3>
              <p className="text-[#495049] mb-6 leading-relaxed">
                Join open rooms or create your own with up to 8 people.
              </p>
              <div className="flex items-center justify-center gap-2 text-[#de212e] font-semibold">
                <span>Browse Rooms</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#131113] mb-4" 
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Video chat, unfiltered
            </h2>
            <p className="text-lg text-[#495049] max-w-2xl mx-auto">
              No profiles. No followers. Just real conversations with real people.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Anonymous */}
            <div className="bg-white border border-[#B0E0E6] rounded-2xl p-8 shadow-lg text-center">
              <div className="w-14 h-14 bg-[#3370ff] rounded-xl flex items-center justify-center mb-6 mx-auto">
                <EyeOff className="w-7 h-7 text-white" />
              </div>
              <h3 
                className="text-xl font-bold text-[#131113] mb-3" 
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Stay Anonymous
              </h3>
              <p className="text-[#495049] leading-relaxed">
                No sign up required. No names. Just you and the conversation.
              </p>
            </div>

            {/* Feature 2: Random Matching */}
            <div className="bg-white border border-[#B0E0E6] rounded-2xl p-8 shadow-lg text-center">
              <div className="w-14 h-14 bg-[#de212e] rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Shuffle className="w-7 h-7 text-white" />
              </div>
              <h3 
                className="text-xl font-bold text-[#131113] mb-3" 
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Random Matching
              </h3>
              <p className="text-[#495049] leading-relaxed">
                Get paired with someone new every time. You never know who you'll meet.
              </p>
            </div>

            {/* Feature 3: Skip Anytime */}
            <div className="bg-white border border-[#B0E0E6] rounded-2xl p-8 shadow-lg text-center">
              <div className="w-14 h-14 bg-[#fcba03] rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Zap className="w-7 h-7 text-[#131113]" />
              </div>
              <h3 
                className="text-xl font-bold text-[#131113] mb-3" 
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Skip Anytime
              </h3>
              <p className="text-[#495049] leading-relaxed">
                Not vibing? Skip to the next person instantly. No pressure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#131113] mb-4" 
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Get started in seconds
            </h2>
            <p className="text-lg text-[#495049]">Three simple steps</p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#3370ff] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-3xl">
                1
              </div>
              <h3 
                className="text-xl font-bold text-[#131113] mb-2" 
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Open Fluxx
              </h3>
              <p className="text-[#495049]">No downloads, no sign ups</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#de212e] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-3xl">
                2
              </div>
              <h3 
                className="text-xl font-bold text-[#131113] mb-2" 
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Allow Camera
              </h3>
              <p className="text-[#495049]">Grant access to start chatting</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#fcba03] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#131113] font-bold text-3xl">
                3
              </div>
              <h3 
                className="text-xl font-bold text-[#131113] mb-2" 
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Start Chatting
              </h3>
              <p className="text-[#495049]">Get matched with someone instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 md:px-12 bg-[#3370ff]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 
            className="text-4xl md:text-6xl font-bold text-white mb-6" 
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Ready to meet someone new?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Jump in. It&apos;s free, anonymous, and takes 2 seconds.
          </p>
          <Link
            href="/chat"
            className="inline-block px-12 py-5 bg-white hover:bg-[#E0F6FF] text-[#3370ff] font-bold rounded-lg text-xl transition-colors"
          >
            Start Chatting Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-12 bg-white border-t border-[#B0E0E6]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-3xl font-bold text-[#3370ff]" 
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              fluxx
            </Link>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#495049]">
              <Link href="/privacy" className="hover:text-[#131113] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#131113] transition-colors">
                Terms
              </Link>
              <Link href="/safety" className="hover:text-[#131113] transition-colors">
                Safety
              </Link>
              <Link href="/contact" className="hover:text-[#131113] transition-colors">
                Contact
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-[#E0F6FF] hover:bg-[#3370ff] rounded-lg flex items-center justify-center text-[#495049] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[#E0F6FF] hover:bg-[#3370ff] rounded-lg flex items-center justify-center text-[#495049] hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
          <p className="text-center text-sm text-[#495049]">
            © 2025 Fluxx. Made for students, by students.
          </p>
        </div>
      </footer>
    </main>
  );
}
