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
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    text: "Using this AI platform has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
    href: "https://twitter.com/emmaai",
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    text: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
    href: "https://twitter.com/davidtech",
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    text: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive.",
  },
]

const navItems = [
  { name: "Home", url: "#", icon: "HomeIcon" },
  { name: "Features", url: "#features", icon: "User" },
  { name: "Testimonials", url: "#testimonials", icon: "Briefcase" },
  { name: "Contact", url: "#contact", icon: "FileText" },
]

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-background">
      <NavBar items={navItems} />

      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Choose Our Platform?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the features that make us the preferred choice for developers worldwide.
          </p>
        </div>
        <FeaturesSectionWithHoverEffects />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials">
        <TestimonialsSection
          title="Trusted by developers worldwide"
          description="Join thousands of developers who are already building the future with our AI platform"
          testimonials={testimonials}
        />
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and transform your business today.
          </p>
          <Button size="lg" className="text-lg px-8">
            Start Your Free Trial
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
