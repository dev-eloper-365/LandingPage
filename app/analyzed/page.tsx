"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { extractResumeData, extractResumeDataFromImage } from "@/lib/pdf"

export default function AnalyzedPage() {
  const router = useRouter()
  const [data, setData] = React.useState<{ items: Array<any>; generatedAt: string } | null>(null)
  const [adding, setAdding] = React.useState(false)
  const [error, setError] = React.useState<string>("")
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("resume-analysis")
      if (raw) {
        setData(JSON.parse(raw))
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const handleExport = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resume-analysis.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const analyzeViaServer = async (file: File) => {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/extract", { method: "POST", body: form })
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

  const onAddMore = () => fileInputRef.current?.click()

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!data) return
    setError("")
    setAdding(true)
    try {
      const results: any[] = []
      for (const file of Array.from(files)) {
        const lower = file.name.toLowerCase()
        const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf")
        const isImage = file.type.startsWith("image/") || /(\.png|\.jpg|\.jpeg|\.webp|\.bmp)$/i.test(lower)
        if (!isPdf && !isImage) continue
        try {
          if (isPdf) {
            const server = await analyzeViaServer(file)
            results.push(server)
          } else if (isImage) {
            const ocr = await extractResumeDataFromImage(file)
            results.push(ocr)
          }
        } catch (err) {
          if (isPdf) {
            try {
              const client = await extractResumeData(file)
              results.push(client)
            } catch {}
          } else if (isImage) {
            // already OCR on client; ignore
          }
        }
      }
      if (results.length > 0) {
        const next = { items: [...(data.items || []), ...results], generatedAt: new Date().toISOString() }
        setData(next)
        localStorage.setItem("resume-analysis", JSON.stringify(next))
      }
    } catch (e: any) {
      setError(e?.message || "Failed to add files")
    } finally {
      setAdding(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (!data) {
    return (
      <main className="w-full min-h-screen bg-background text-foreground px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Analyzed Data</h1>
          <p className="text-muted-foreground mb-6">No analysis found. Please upload a PDF from the home page.</p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </main>
    )
  }

  const items = data.items || []

  return (
    <main className="w-full min-h-screen bg-background text-foreground px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Analyzed Data</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/">Back</Link>
            </Button>
            <Button variant="secondary" onClick={onAddMore} disabled={adding}>{adding ? "Adding..." : "Add more resumes"}</Button>
            <Button onClick={handleExport}>Export JSON</Button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Filename</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Skills</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr className="border-t" key={`${item.filename}-${idx}`}>
                  <td className="p-3 align-top">{item?.filename || ""}</td>
                  <td className="p-3 align-top">{item?.name || ""}</td>
                  <td className="p-3 align-top">{item?.email || ""}</td>
                  <td className="p-3 align-top">{item?.phone || ""}</td>
                  <td className="p-3 align-top whitespace-pre-wrap">{item?.skills || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Extracted Text</h2>
          <pre className="whitespace-pre-wrap text-sm border rounded-lg p-4 bg-muted/30">{items[items.length - 1]?.rawText || ""}</pre>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp,image/bmp"
          multiple
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
      </div>
    </main>
  )
} 