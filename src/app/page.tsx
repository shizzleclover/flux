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
          className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-xs font-medium h-12 w-fit"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <span className="text-accent text-xs">☆*: .｡. o(≧▽≦)o .｡.:*☆</span>
          <span className="text-white/90 text-sm font-medium">Lowkirkueinly Fun</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-4xl leading-tight mb-12 tracking-tight">
          Connect with random peers, instantly
        </h1>

        {/* Buttons - Apple Liquid Glass Style */}
        <div className="flex items-center gap-6">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center text-white font-medium text-sm px-10 py-5 rounded-full w-56 h-16 transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            Get Started
          </Link>
          {/* <button
            className="inline-flex items-center justify-center text-white/80 font-semibold text-lg px-14 py-6 rounded-full transition-all hover:scale-105 active:scale-95 hover:text-white hover:bg-white/10"
            style={{
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Learn More
          </button> */}
        </div>
      </div>
    </main>
  );
}
