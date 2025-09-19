import { NextResponse } from "next/server"
import pdfParse from "pdf-parse"
import { parseResumeFields } from "@/lib/parse"

export const runtime = "nodejs"

async function extractWithPdfJs(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist") as any
  // Use same CDN worker; Node can fetch it as well
  pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js"
  const loadingTask = pdfjs.getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  let fullText = ""
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const strings = content.items.map((item: any) => (item.str ?? ""))
    fullText += strings.join(" ") + "\n"
  }
  return fullText
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let rawText = ""
    try {
      const result = await pdfParse(buffer)
      rawText = result.text || ""
    } catch (e: any) {
      try {
        rawText = await extractWithPdfJs(buffer)
      } catch (e2: any) {
        return NextResponse.json({ error: "Failed to extract PDF", details: String(e2?.message || e2) }, { status: 500 })
      }
    }

    const { name, email, phone, skills } = parseResumeFields(rawText)

    return NextResponse.json({
      filename: file.name,
      name,
      email,
      phone,
      skills,
      rawText,
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to extract PDF", details: String(err?.message || err) }, { status: 500 })
  }
} 