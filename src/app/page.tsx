"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Brain, KanbanSquare, FileText, Calendar, Search, GitBranch, Pencil, Layers, Zap, Shield, Globe } from "lucide-react"

const features = [
  { icon: Brain, title: "AI Chat", desc: "OpenRouter-powered assistant with GPT, Claude & Gemini", color: "from-cyan-400 to-blue-500" },
  { icon: KanbanSquare, title: "Kanban Board", desc: "Drag-and-drop project management with real-time sync", color: "from-pink-400 to-rose-500" },
  { icon: FileText, title: "Markdown Notes", desc: "Rich editor with autosave, preview toggle & tagging", color: "from-purple-400 to-violet-500" },
  { icon: Calendar, title: "Calendar", desc: "Interactive FullCalendar with week, month & day views", color: "from-emerald-400 to-teal-500" },
  { icon: Pencil, title: "Whiteboard", desc: "tldraw infinite canvas with shape snapshots", color: "from-orange-400 to-amber-500" },
  { icon: Search, title: "Global Search", desc: "PostgreSQL full-text search across all your content", color: "from-cyan-400 to-sky-500" },
  { icon: GitBranch, title: "GitHub Sync", desc: "Browse repos, issues & PRs without leaving Nexus", color: "from-indigo-400 to-purple-500" },
  { icon: Layers, title: "Projects", desc: "Organize work with status tracking & task counts", color: "from-pink-400 to-fuchsia-500" },
]

const techStack = [
  "Next.js 15", "TypeScript", "Tailwind CSS", "shadcn/ui", "Supabase",
  "PostgreSQL", "OpenRouter", "tldraw", "Framer Motion", "Zustand",
  "FullCalendar", "dnd-kit", "Lucide", "React Hook Form", "Zod",
]

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible")
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll(".reveal").forEach((el) => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">
      {/* Particle canvas */}
      <canvas id="particles" className="fixed inset-0 z-0 pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12" style={{ background: "rgba(10,10,26,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,240,255,0.08)" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-lg" style={{ background: "linear-gradient(135deg, #00f0ff, #ff0080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nexus AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-md font-medium" style={{ background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.2)", color: "#00f0ff", transition: "all 0.3s" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 20px rgba(0,240,255,0.3)"; e.currentTarget.style.background = "rgba(0,240,255,0.15)" }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "rgba(0,240,255,0.1)" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ paddingTop: "4rem" }}>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] rounded-full bg-pink-500/10 blur-[120px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-purple-500/5 blur-[150px]" />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider mb-8" style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)", color: "#00f0ff" }}>
            <Zap className="w-3 h-3" />
            AI-POWERED PRODUCTIVITY SUITE
          </div>

          <h1 className="reveal text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6" style={{ transitionDelay: "0.1s" }}>
            <span className="block" style={{ background: "linear-gradient(135deg, #e8e8f0 0%, #a0a0b8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your Intelligent
            </span>
            <span className="block mt-2" style={{ background: "linear-gradient(135deg, #00f0ff, #ff0080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Workspace
            </span>
          </h1>

          <p className="reveal text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ transitionDelay: "0.2s" }}>
            Nexus AI combines project management, AI chat, documentation, real-time collaboration, and GitHub integration into one beautiful, unified experience.
          </p>

          <div className="reveal flex flex-wrap justify-center gap-4" style={{ transitionDelay: "0.3s" }}>
            <Link href="/signup" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-md font-semibold text-sm transition-all duration-300" style={{ background: "linear-gradient(135deg, #00f0ff, #0088ff)", color: "#0a0a1a", boxShadow: "0 0 30px rgba(0,240,255,0.2)" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 50px rgba(0,240,255,0.4)"; e.currentTarget.style.transform = "translateY(-2px)" }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 30px rgba(0,240,255,0.2)"; e.currentTarget.style.transform = "translateY(0)" }}>
              Start Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md font-semibold text-sm transition-all duration-300" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#e8e8f0", background: "rgba(255,255,255,0.03)" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)" }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)" }}>
              Sign In
            </Link>
          </div>

          <div className="reveal mt-16 flex flex-wrap justify-center gap-6 md:gap-12" style={{ transitionDelay: "0.4s" }}>
            {[
              { num: "10+", label: "Integrated Tools" },
              { num: "100%", label: "Free & Open" },
              { num: "Real-time", label: "Collaboration" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-black" style={{ background: "linear-gradient(135deg, #00f0ff, #ff0080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.num}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-1 tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 reveal">
          <span className="text-xs text-gray-600 tracking-widest">SCROLL</span>
          <div className="w-5 h-8 rounded-full border border-gray-700 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-cyan-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: "linear-gradient(rgba(255,0,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,128,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider mb-6" style={{ background: "rgba(255,0,128,0.08)", border: "1px solid rgba(255,0,128,0.15)", color: "#ff0080" }}>
              <Sparkles className="w-3 h-3" />
              EVERYTHING YOU NEED
            </div>
            <h2 className="reveal text-3xl md:text-5xl font-black mb-4" style={{ transitionDelay: "0.1s" }}>
              One workspace to <span style={{ background: "linear-gradient(135deg, #00f0ff, #ff0080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>unify your workflow</span>
            </h2>
            <p className="reveal text-gray-400 max-w-xl mx-auto" style={{ transitionDelay: "0.15s" }}>
              Everything you need to manage projects, take notes, collaborate, and harness AI — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="reveal group relative rounded-xl p-5 transition-all duration-500" style={{ transitionDelay: `${0.05 + i * 0.04}s`, background: "rgba(15,15,42,0.4)", border: "1px solid rgba(0,240,255,0.06)", backdropFilter: "blur(12px)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,240,255,0.2)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(0,240,255,0.1)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,240,255,0.06)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `linear-gradient(135deg, ${f.color.split(" ")[0].replace("from-", "").replace("-400", "").replace("-500", "")}22, transparent)` }}>
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5 text-white/90">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  <div className="absolute top-0 left-4 right-4 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(90deg, transparent, #00f0ff, #ff0080, transparent)" }} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== ARCHITECTURE ===== */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 right-0 w-[30vw] h-[30vw] rounded-full bg-cyan-500/5 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[25vw] h-[25vw] rounded-full bg-pink-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider mb-6" style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)", color: "#00f0ff" }}>
            <Shield className="w-3 h-3" />
            MODERN ARCHITECTURE
          </div>
          <h2 className="reveal text-3xl md:text-5xl font-black mb-12" style={{ transitionDelay: "0.1s" }}>
            Built with <span style={{ background: "linear-gradient(135deg, #00f0ff, #ff0080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>cutting-edge</span> technology
          </h2>

          <div className="reveal flex flex-wrap items-center justify-center gap-2 md:gap-4" style={{ transitionDelay: "0.15s" }}>
            {["Browser", "→", "Next.js 15", "↕", "Supabase", "↕", "OpenRouter", "↕", "GitHub API"].map((node, i) => (
              node === "→" || node === "↕" ? (
                <span key={i} className="text-gray-600 text-sm">{node}</span>
              ) : (
                <span key={i} className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-300" style={{ background: "rgba(15,15,42,0.5)", border: "1px solid rgba(0,240,255,0.1)", color: "#e8e8f0" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00f0ff"; e.currentTarget.style.boxShadow = "0 0 20px rgba(0,240,255,0.2)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,240,255,0.1)"; e.currentTarget.style.boxShadow = "none" }}
                >
                  {node}
                </span>
              )
            ))}
          </div>

          <div className="reveal mt-8 flex flex-wrap justify-center gap-2" style={{ transitionDelay: "0.2s" }}>
            {["Row Level Security", "Server Actions", "RLS Policies", "Realtime Subscriptions", "Full-Text Search"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded text-xs font-medium" style={{ background: "rgba(255,0,128,0.08)", border: "1px solid rgba(255,0,128,0.15)", color: "#ff0080" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: "linear-gradient(rgba(0,240,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider mb-6" style={{ background: "rgba(255,0,128,0.08)", border: "1px solid rgba(255,0,128,0.15)", color: "#ff0080" }}>
            <Globe className="w-3 h-3" />
            100% FREE TECH STACK
          </div>
          <h2 className="reveal text-3xl md:text-5xl font-black mb-10" style={{ transitionDelay: "0.1s" }}>
            Premium tools, <span style={{ background: "linear-gradient(135deg, #00f0ff, #ff0080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>zero cost</span>
          </h2>

          <div className="reveal flex flex-wrap justify-center gap-2" style={{ transitionDelay: "0.15s" }}>
            {techStack.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300" style={{ background: "rgba(15,15,42,0.5)", border: "1px solid rgba(0,240,255,0.08)", color: "rgba(232,232,240,0.7)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,240,255,0.3)"; e.currentTarget.style.color = "#00f0ff"; e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,240,255,0.08)"; e.currentTarget.style.color = "rgba(232,232,240,0.7)"; e.currentTarget.style.transform = "translateY(0)" }}
              >
                {t}
              </span>
            ))}
          </div>

          <p className="reveal text-sm text-gray-600 mt-8" style={{ transitionDelay: "0.2s" }}>
            Supabase Free + Vercel Hobby + OpenRouter free models = fully functional
          </p>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vw] rounded-full bg-gradient-to-r from-cyan-500/10 to-pink-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="reveal mb-8">
            <Sparkles className="w-12 h-12 mx-auto" style={{ color: "#00f0ff", filter: "drop-shadow(0 0 20px rgba(0,240,255,0.3))" }} />
          </div>
          <h2 className="reveal text-3xl md:text-5xl font-black mb-6" style={{ transitionDelay: "0.1s" }}>
            Ready to build<br />
            <span style={{ background: "linear-gradient(135deg, #00f0ff, #ff0080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>your workspace?</span>
          </h2>
          <p className="reveal text-gray-400 mb-10 max-w-md mx-auto" style={{ transitionDelay: "0.15s" }}>
            Join Nexus AI and transform how you work. Free to start, no credit card needed.
          </p>
          <div className="reveal flex flex-wrap justify-center gap-4" style={{ transitionDelay: "0.2s" }}>
            <Link href="/signup" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-md font-semibold text-sm transition-all duration-300" style={{ background: "linear-gradient(135deg, #00f0ff, #0088ff)", color: "#0a0a1a", boxShadow: "0 0 30px rgba(0,240,255,0.2)" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 50px rgba(0,240,255,0.4)"; e.currentTarget.style.transform = "translateY(-2px)" }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 30px rgba(0,240,255,0.2)"; e.currentTarget.style.transform = "translateY(0)" }}>
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative py-12 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold" style={{ background: "linear-gradient(135deg, #00f0ff, #ff0080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nexus AI</span>
          </div>
          <p className="text-xs text-gray-700">
            Built with Next.js 15 · Supabase · OpenRouter · tldraw · Framer Motion
          </p>
        </div>
      </footer>

      <style>{`
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        #particles { z-index: 0; }
        @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          const c = document.getElementById('particles');
          if (!c) return;
          const ctx = c.getContext('2d');
          let p = [];
          function resize(){ c.width = innerWidth; c.height = innerHeight; }
          addEventListener('resize', resize);
          resize();
          class Pt {
            constructor(){
              this.x = Math.random() * c.width;
              this.y = Math.random() * c.height;
              this.s = Math.random() * 1.5 + 0.5;
              this.sx = (Math.random() - 0.5) * 0.3;
              this.sy = (Math.random() - 0.5) * 0.3;
              this.o = Math.random() * 0.3 + 0.05;
              this.h = Math.random() > 0.5 ? '0,240,255' : '255,0,128';
            }
            u(){ this.x += this.sx; this.y += this.sy; if(this.x<0||this.x>c.width)this.sx*=-1; if(this.y<0||this.y>c.height)this.sy*=-1; }
            d(){ ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI*2); ctx.fillStyle = 'rgba('+this.h+','+this.o+')'; ctx.fill(); }
          }
          const ct = Math.min(60, Math.floor((c.width * c.height) / 20000));
          for(let i=0;i<ct;i++) p.push(new Pt());
          function an(){
            ctx.clearRect(0,0,c.width,c.height);
            p.forEach(x=>{ x.u(); x.d(); });
            for(let i=0;i<p.length;i++) for(let j=i+1;j<p.length;j++){ const dx=p[i].x-p[j].x, dy=p[i].y-p[j].y, d=Math.sqrt(dx*dx+dy*dy); if(d<120){ ctx.beginPath(); ctx.moveTo(p[i].x,p[i].y); ctx.lineTo(p[j].x,p[j].y); ctx.strokeStyle='rgba(0,240,255,'+((1-d/120)*0.06)+')'; ctx.lineWidth=0.5; ctx.stroke(); } }
            requestAnimationFrame(an);
          }
          an();
        })();
      `}} />
    </div>
  )
}
