"use client"

import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from "pdfjs-dist"

export type ExtractedResumeData = {
  filename: string
  name: string
  email: string
  phone: string
  skills: string
  rawText: string
}

// Default worker via CDN (can be overridden at runtime)
const DEFAULT_WORKER = "https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js"
GlobalWorkerOptions.workerSrc = DEFAULT_WORKER

async function loadPdf(arrayBuffer: ArrayBuffer): Promise<PDFDocumentProxy> {
  try {
    const loadingTask = getDocument({ data: arrayBuffer })
    return await loadingTask.promise as PDFDocumentProxy
  } catch (err) {
    // Retry with local worker path if available
    try {
      GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
      const loadingTask2 = getDocument({ data: arrayBuffer })
      return await loadingTask2.promise as PDFDocumentProxy
    } catch (err2) {
      // Restore default for any subsequent attempts
      GlobalWorkerOptions.workerSrc = DEFAULT_WORKER
      throw err2
    }
  }
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await loadPdf(arrayBuffer)
  let fullText = ""
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const strings = content.items.map((item: any) => (item.str ?? ""))
    fullText += strings.join(" ") + "\n"
  }
  return fullText
}

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
// Supports Indian and general international formats, strips separators
const PHONE_REGEX = /(?:(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4,6})/g

export function parseResumeFields(text: string): { name: string; email: string; phone: string; skills: string } {
  const normalized = text.replace(/\u00A0/g, " ")
  const lines = normalized.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  const emailMatch = normalized.match(EMAIL_REGEX)
  const email = emailMatch ? emailMatch[0] : ""

  const phoneCandidates = Array.from(normalized.matchAll(PHONE_REGEX)).map(m => m[0])
  const cleanedPhone = phoneCandidates
    .map(p => p.replace(/[^+\d]/g, ""))
    .find(p => p.length >= 10 && p.length <= 15) || ""

  // Name heuristic: first non-empty line that doesn't contain common labels and is not email/phone
  const labelWords = ["curriculum vitae","resume","contact","email","phone","mobile","address","skills","experience","education","summary","objective"]
  let name = ""
  for (const line of lines.slice(0, 10)) {
    const lower = line.toLowerCase()
    const hasLabel = labelWords.some(w => lower.includes(w))
    const hasEmail = EMAIL_REGEX.test(line)
    const hasManyDigits = (line.match(/\d/g)?.length ?? 0) >= 4
    if (!hasLabel && !hasEmail && !hasManyDigits && /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(line)) {
      name = line.replace(/^[^A-Za-z]*/, "").trim()
      break
    }
  }

  // Skills extraction: look for sections titled Skills/Technical Skills and capture following text
  const skillsSectionRegex = /(skills|technical skills|key skills|skills & tools)[:\-]?\s*/i
  let skills = ""
  const skillsIdx = lines.findIndex(l => skillsSectionRegex.test(l))
  if (skillsIdx !== -1) {
    const collect: string[] = []
    for (let i = skillsIdx; i < Math.min(lines.length, skillsIdx + 8); i++) {
      const line = lines[i]
      if (/^(experience|work experience|education|projects|summary|objective|certifications)\b/i.test(line)) break
      const cleaned = line.replace(skillsSectionRegex, "").replace(/[•\-\u2022]/g, "").trim()
      if (cleaned) collect.push(cleaned)
    }
    skills = collect.join(", ")
  }

  // Fallback: try to infer skills as comma/pipe/semicolon separated tokens from top of resume
  if (!skills) {
    const potential = lines
      .slice(0, 40)
      .map(l => l)
      .join(" ")
    const tokens = potential.split(/[;,\|]/).map(t => t.trim()).filter(t => t.length > 1 && t.length < 50)
    const filtered = tokens.filter(t => /[A-Za-z]/.test(t) && !EMAIL_REGEX.test(t) && (t.match(/\d/g)?.length ?? 0) < 4)
    skills = Array.from(new Set(filtered)).slice(0, 20).join(", ")
  }

  return { name, email, phone: cleanedPhone, skills }
}

export async function extractResumeData(file: File) {
  const rawText = await extractTextFromPdf(file)
  const { name, email, phone, skills } = parseResumeFields(rawText)
  return {
    filename: file.name,
    name,
    email,
    phone,
    skills,
    rawText,
  }
}

export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const dynamicImport: any = (Function("return import('tesseract.js')") as any)()
    const mod = await dynamicImport
    const createWorker = (mod?.createWorker || mod?.default?.createWorker)
    if (!createWorker) throw new Error("OCR module unavailable")
    const worker = await createWorker("eng")
    try {
      const { data } = await worker.recognize(file)
      return (data?.text || "").trim()
    } finally {
      await worker.terminate()
    }
  } catch (e) {
    throw new Error("OCR not available. Please install tesseract.js or upload a PDF.")
  }
}

export async function extractResumeDataFromImage(file: File) {
  const rawText = await extractTextFromImage(file)
  const { name, email, phone, skills } = parseResumeFields(rawText)
  return {
    filename: file.name,
    name,
    email,
    phone,
    skills,
    rawText,
  }
} 