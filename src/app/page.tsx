'use client';

import Link from "next/link";
import dynamic from "next/dynamic";

const FaultyTerminal = dynamic(() => import("@/components/FaultyTerminal"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={1}
          pause={false}
          scanlineIntensity={1}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint="#00ffcc"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={true}
          brightness={0.2}
        />
      </div>

      {/* Floating Navbar - Apple Liquid Glass */}
      {/* Floating Navbar - Apple Liquid Glass */}
      {/* Floating Navbar - Apple Liquid Glass */}
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center justify-center gap-2 rounded-full px-12 py-12 text-xs font-medium h-12 w-fit"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <span className="text-accent text-xs"></span>
          <span className="text-white/90 text-sm font-medium">Ever Tried Calling a Stranger on Snap</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight mb-12 tracking-tight">
          Touch grass
        </h1>

        {/* Call Mode Cards */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {/* One-on-One Card */}
          <Link
            href="/chat"
            className="group flex flex-col items-center justify-center text-center w-64 h-40 rounded-2xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.3) 0%, rgba(108, 92, 231, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(108, 92, 231, 0.4)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">One-on-One</span>
            <span className="text-white/50 text-sm mt-1">Random matching</span>
          </Link>

          {/* Group Card */}
          <Link
            href="/groups"
            className="group flex flex-col items-center justify-center text-center w-64 h-40 rounded-2xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 204, 0.2) 0%, rgba(0, 255, 204, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 204, 0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">Group Call</span>
            <span className="text-white/50 text-sm mt-1">Join or create rooms</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
