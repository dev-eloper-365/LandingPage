import { HomeIcon, User, Briefcase, FileText } from "lucide-react"
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects"
import { Footerdemo } from "@/components/ui/footer-section"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/ui/hero-section"
import { NavBar } from "@/components/ui/tubelight-navbar"

const testimonials = [
  {
    author: {
      name: "Aanya Sharma",
      handle: "@aanyacodes",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    text: "Resume Analyzer helped me tailor my resume to a job description and I got interviews within a week.",
    href: "https://twitter.com/aanyacodes",
  },
  {
    author: {
      name: "Rohit Verma",
      handle: "@rohitdev",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    text: "The job-match insights are spot on. I fixed gaps the tool highlighted and doubled my response rate.",
    href: "https://twitter.com/rohitdev",
  },
  {
    author: {
      name: "Neha Patel",
      handle: "@nehaml",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    text: "Finally, a resume tool that understands context. The ATS checks and skill extraction were incredibly helpful.",
  },
]

const navItems = [
  { name: "Home", url: "#", icon: "HomeIcon" },
  { name: "Features", url: "#features", icon: "User" },
  { name: "Success Stories", url: "#testimonials", icon: "Briefcase" },
  { name: "Support", url: "#contact", icon: "FileText" },
]

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-background">
      <NavBar items={navItems} />

      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Use Resume Analyzer?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how our AI highlights key skills, checks ATS readiness, matches job descriptions, and boosts interview chances.
          </p>
        </div>
        <FeaturesSectionWithHoverEffects />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials">
        <TestimonialsSection
          title="Trusted by job seekers and recruiters"
          description="Join thousands using Resume Analyzer to improve resumes, tailor applications, and land interviews."
          testimonials={testimonials}
        />
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to optimize your resume?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your resume and get instant, actionable feedback with ATS checks and role-based suggestions.
          </p>
          <Button size="lg" className="text-lg px-8">
            Analyze My Resume
          </Button>
        </div>
      </section>

      {/* Footer */}
      <section id="contact">
        <Footerdemo />
      </section>
    </main>
  )
}
