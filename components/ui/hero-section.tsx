"use client"
import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { cn } from "@/lib/utils"
import { extractResumeData } from "@/lib/pdf"

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-x-hidden">
        <section className="relative">
          <div className="absolute inset-0 z-0">
            <video autoPlay muted loop playsInline className="h-full w-full object-cover">
              <source
                src="video.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="relative z-10 pb-24 pt-12 md:pb-32 lg:pb-56 lg:pt-44">
            <div className="relative mx-auto flex max-w-6xl flex-col px-6 lg:block">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:w-1/2 lg:text-left">
                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-bold text-white md:text-6xl lg:mt-16 xl:text-7xl">
                  Scan Your Resume here
                </h1>
                <p className="mt-8 max-w-2xl text-pretty text-lg font-semibold text-white">
                  Get instant, ATS-ready feedback, skills extraction, and job match insights to make every application count.
                </p>

                {/* <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                  <Button asChild size="lg" className="px-5 text-base font-bold">
                    <Link href="#link">
                      <span className="text-nowrap">Upload Resume</span>
                    </Link>
                  </Button>
                  <Button key={2} asChild size="lg" variant="ghost" className="px-5 text-base font-bold text-white border-white hover:bg-white hover:text-black">
                    <Link href="#link">
                      <span className="text-nowrap">View Sample Report</span>
                    </Link>
                  </Button>
                </div> */}

                <PdfDropZone />
              </div>
            </div>
          </div>
        </section>
        <section className="bg-background pb-16 md:pb-32">
          <div className="group relative m-auto max-w-6xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:pr-6">
                <p className="text-end text-sm">Trusted by candidates and teams</p>
              </div>
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/nvidia.svg"
                      alt="Nvidia Logo"
                      height="20"
                      width="auto"
                    />
                  </div>

                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/column.svg"
                      alt="Column Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/github.svg"
                      alt="GitHub Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/nike.svg"
                      alt="Nike Logo"
                      height="20"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-5 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                      alt="Lemon Squeezy Logo"
                      height="20"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-4 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/laravel.svg"
                      alt="Laravel Logo"
                      height="16"
                      width="auto"
                    />
                  </div>
                  <div className="flex">
                    <img
                      className="mx-auto h-7 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/lilly.svg"
                      alt="Lilly Logo"
                      height="28"
                      width="auto"
                    />
                  </div>

                  <div className="flex">
                    <img
                      className="mx-auto h-6 w-fit dark:invert"
                      src="https://html.tailus.io/blocks/customers/openai.svg"
                      alt="OpenAI Logo"
                      height="24"
                      width="auto"
                    />
                  </div>
                </InfiniteSlider>

                <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}


const HeroHeader = () => {
  return (
    <header>
      <nav className="group bg-background/50 fixed z-20 w-full border-b backdrop-blur-3xl">
        <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
          <div className="flex items-center justify-center py-3 lg:py-4">
            {/* Logo removed */}
          </div>
        </div>
      </nav>
    </header>
  )
}

function PdfDropZone() {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)

  const analyzeViaServer = async (file: File) => {
    const form = new FormData()
    form.append("file", file)
    const base = process.env.NEXT_PUBLIC_PY_API_URL || "http://localhost:5001"
    const res = await fetch(`${base}/analyze`, { method: "POST", body: form })
    if (!res.ok) {
      let details = ""
      try {
        const j = await res.json()
        details = j?.details || j?.error || ""
      } catch {}
      throw new Error(details || `Server error: ${res.status}`)
    }
    return await res.json()
  }

  const handleFiles = async (files: FileList | null) => {
    setError("")
    if (!files || files.length === 0) return
    const file = files[0]
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.")
      return
    }
    try {
      setLoading(true)
      let data
      try {
        data = await analyzeViaServer(file)
      } catch (serverErr: any) {
        try {
          data = await extractResumeData(file)
        } catch (clientErr: any) {
          throw new Error(serverErr?.message || "Failed to process PDF")
        }
      }

      const payload = { items: [data], generatedAt: new Date().toISOString() }
      localStorage.setItem("resume-analysis", JSON.stringify(payload))
      router.push("/analyzed")
    } catch (e: any) {
      setError(e?.message || "Failed to process PDF. Please try another file.")
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="mt-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 bg-white/5 text-white",
          isDragging ? "border-white" : "border-white/50"
        )}
      >
        <p className="text-sm">Drag & drop a PDF resume here, or</p>
        <div className="mt-3">
          <Button variant="secondary" onClick={() => inputRef.current?.click()} size="sm" disabled={loading}>{loading ? "Processing..." : "Choose PDF"}</Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  )
}

