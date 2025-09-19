import type React from "react"
import { cn } from "@/lib/utils"
import { Terminal, Zap, DollarSign, Cloud, Users, HelpCircle, Settings, Heart } from "lucide-react"

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Built for job seekers",
      description: "Built for candidates, recruiters, hiring managers, and career coaches.",
      icon: <Terminal className="h-6 w-6" />,
    },
    {
      title: "Easy to use",
      description: "Upload a resume and get a clear, actionable report in seconds.",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: "Transparent pricing",
      description: "Simple, fair plans. No lock‑in, cancel anytime. No credit card required to start.",
      icon: <DollarSign className="h-6 w-6" />,
    },
    {
      title: "Reliable and secure",
      description: "Always available with secure processing for your documents.",
      icon: <Cloud className="h-6 w-6" />,
    },
    {
      title: "Collaborative reviews",
      description: "Share read‑only links with mentors or teammates for quick feedback",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "24/7 support",
      description: "Get help anytime—our AI and team are here around the clock.",
      icon: <HelpCircle className="h-6 w-6" />,
    },
    {
      title: "Satisfaction guarantee",
      description: "Not a fit? Get a hassle‑free refund within 7 days.",
      icon: <Settings className="h-6 w-6" />,
    },
    {
      title: "And more",
      description: "Keyword checks, skill gaps, job match scores, and tailored suggestions",
      icon: <Heart className="h-6 w-6" />,
    },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  )
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string
  description: string
  icon: React.ReactNode
  index: number
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature border-border",
        (index === 0 || index === 4) && "lg:border-l border-border",
        index < 4 && "lg:border-b border-border",
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-muted/50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-muted-foreground">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-muted group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">{description}</p>
    </div>
  )
}
