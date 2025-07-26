"use client"

import { useState, useEffect, useRef } from "react"

export default function LunchBoxLanding() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringDesignElement, setIsHoveringDesignElement] = useState(false)
  const scrollRef = useRef<NodeJS.Timeout | null>(null)
  const mouseRef = useRef<NodeJS.Timeout | null>(null)

  // Check system preference on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(prefersDark)
    }
  }, [])

  // Handle scroll for morphing animation with debounce
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        clearTimeout(scrollRef.current)
      }

      scrollRef.current = setTimeout(() => {
        setScrollY(window.scrollY)
      }, 10) // Small debounce for smoother performance
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      if (scrollRef.current) clearTimeout(scrollRef.current)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Track mouse position for magnetic effects with debounce
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRef.current) {
        clearTimeout(mouseRef.current)
      }

      mouseRef.current = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }, 10) // Small debounce for smoother performance
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => {
      if (mouseRef.current) clearTimeout(mouseRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Calculate morphing progress based on scroll - simplified
  const getShapeProgress = () => {
    if (typeof window === "undefined") return { borderRadius: "50%", rotation: "0deg" }

    const windowHeight = window.innerHeight
    const totalScrollHeight = document.documentElement.scrollHeight - windowHeight

    // Avoid division by zero
    if (totalScrollHeight <= 0) return { borderRadius: "50%", rotation: "0deg" }

    // First transition: circle to square (0% to 40% of scroll)
    const firstTransition = Math.min(scrollY / (totalScrollHeight * 0.4), 1)

    // Second transition: square back to circle (60% to 100% of scroll)
    const secondTransitionStart = totalScrollHeight * 0.6
    const secondTransition = Math.max(0, Math.min((scrollY - secondTransitionStart) / (totalScrollHeight * 0.4), 1))

    // Calculate border radius
    let borderRadius = "50%"
    if (secondTransition > 0) {
      // Morphing back to circle
      borderRadius = `${secondTransition * 50}%`
    } else {
      // Morphing to square
      borderRadius = `${(1 - firstTransition) * 50}%`
    }

    // Calculate rotation - simplified
    const rotation = `${firstTransition * 20 - secondTransition * 20}deg`

    return { borderRadius, rotation }
  }

  const { borderRadius, rotation } = getShapeProgress()

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-500 ${
        isHoveringDesignElement ? "cursor-crosshair" : "cursor-default"
      }`}
    >
      {/* Custom CSS for enhanced UX - simplified */}
      <style jsx global>{`
        ::selection {
          background: ${isDarkMode ? "rgba(168, 85, 247, 0.3)" : "rgba(147, 51, 234, 0.2)"};
          color: ${isDarkMode ? "#ffffff" : "#1f2937"};
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? "rgba(15, 23, 42, 0.1)" : "rgba(243, 244, 246, 0.5)"};
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "rgba(168, 85, 247, 0.3)" : "rgba(147, 51, 234, 0.3)"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "rgba(168, 85, 247, 0.5)" : "rgba(147, 51, 234, 0.5)"};
        }

        /* Breathing animation - simplified */
        @keyframes subtle-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        
        .subtle-breathe {
          animation: subtle-breathe 6s ease-in-out infinite;
          will-change: transform;
        }

        /* Hardware acceleration for performance */
        .hw-accelerate {
          transform: translateZ(0);
          will-change: transform;
        }
      `}</style>

      {/* Artistic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.15),rgba(0,0,0,0))]" />
      <div className="fixed top-0 left-0 w-full h-full">
        <div className="absolute top-[10%] left-[5%] w-32 md:w-64 h-32 md:h-64 rounded-full bg-gradient-to-r from-purple-500/5 to-blue-500/5 dark:from-purple-500/10 dark:to-blue-500/10 blur-3xl subtle-breathe" />
        <div
          className="absolute top-[40%] right-[10%] w-40 md:w-80 h-40 md:h-80 rounded-full bg-gradient-to-r from-pink-500/5 to-orange-500/5 dark:from-pink-500/10 dark:to-orange-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] w-36 md:w-72 h-36 md:h-72 rounded-full bg-gradient-to-r from-green-500/5 to-cyan-500/5 dark:from-green-500/10 dark:to-cyan-500/10 blur-3xl subtle-breathe"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <section className="min-h-screen flex items-center justify-center px-8 md:px-12 lg:px-16 relative">
          {/* Morphing Circles/Squares - simplified with CSS variables */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] lg:w-[800px] h-[400px] md:h-[600px] lg:h-[800px] border border-gray-200 dark:border-white/5 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation})`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[450px] lg:w-[600px] h-[300px] md:h-[450px] lg:h-[600px] border border-gray-200 dark:border-white/10 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation === "0deg" ? "0deg" : `-${rotation}`})`,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[300px] lg:w-[400px] h-[200px] md:h-[300px] lg:h-[400px] border border-gray-300 dark:border-white/20 transition-all duration-500 ease-out hw-accelerate"
            style={{
              borderRadius,
              transform: `translate(-50%, -50%) rotate(${rotation === "0deg" ? "0deg" : `${Number.parseFloat(rotation) * 0.5}deg`})`,
            }}
          />

          <div className="max-w-6xl mx-auto text-center relative">
            <h1 className="text-[3rem] md:text-[6rem] lg:text-[6rem] font-bold leading-none tracking-tighter mb-8 md:mb-12 group cursor-default">
              <span className="block text-gray-900 dark:text-white group-hover:tracking-wide transition-all duration-500">
                LOVE
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text text-transparent group-hover:tracking-wide transition-all duration-500">
                VISION
              </span>
            </h1>

            <div className="text-left text-lg md:text-l lg:text-l dark:text-white/80 mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed font-light">
            <p>God, thank you for this man whose presence feels like home—steady, grounded, and strong.</p> 
            <p>A man who doesn&apos;t just say he&apos;s ready—but *is* ready.</p>
            <p>Because he&apos;s done the inner work. Because he knows who he is. Because he&apos;s lived enough life to strip away illusion and choose depth over distraction.</p>
            <p>He&apos;s not “figuring it out” anymore—he&apos;s building. With purpose. With vision. With integrity.</p>
            <p>He&apos;s true masculine energy—protective, loving, and rooted in his values. He&apos;s playful and present, the kind of man who can command any room he walks into and then come home to me and play fight around the house.</p>
            <p>He pulls me in close during a storm without needing words. He makes me feel cherished *and* challenged. Desired *and* deeply seen.</p>
<p>Together, we create a life nothing short of extraordinary - unconditional love, purpose, and play.</p>
<p>He leads not with bravado, but with grounded presence—a man of integrity whose confidence is quiet, but whose strength and power is never underestimated. </p>
<p>His love and congruence makes me feel safe and brings out my most beautiful feminine energy. </p>
<p>He loves having me as the women by his side. One he can cherish, co-create with, and build a life of legacy, laughter, and love.</p>
<p>He&apos;s secure in himself, not seeking validation from status or women or chaos. He&apos;s fit, sovereign, generous, and present. 
    He&apos;s exited the hustle tunnel, owns his space, and is now seeking something *real*. Something sacred. Something rare.</p>
<p>He wants to build a family—not just biologically, but energetically. A household filled with presence, play, protection, and peace. 
    A life where love is both the foundation and the fuel.</p>
<p>There is no power struggle between us. No unspoken resentment or manipulative silence. When things get hard, we lean *in*. 
    Because we&apos;ve built something too sacred to run from.</p>
<p>We don&apos;t avoid the hard things. We *face* them. We *feel* them. We *rise* through them.</p>
<p>We&apos;re the couple who turns heads—not because we&apos;re performative, but because our connection is *felt*. Energetically congruent. Magnetic. Deep.</p>
<p>This is a relationship that inspires by example—not through perfection, but through congruence.</p>
<p>Together, we become a force for love, for legacy, and for God.</p>
          </div>
          </div>
        </section>
      </main>
    </div>
  )
}
