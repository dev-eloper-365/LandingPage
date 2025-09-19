import { NextResponse } from "next/server"
import { parseResumeFields } from "@/lib/parse"

export const runtime = "nodejs"

const systemPrompt = `You are a resume parsing assistant. Clean messy or LaTeX-like text and return a compact JSON with fields: name, email, phone, skills (comma-separated), cleaned_text (the resume text cleaned and human-readable).

Strict cleanup rules:
- Remove unknown/invalid encoding artifacts (examples:, , Ã, Â, â, etc.) and any non-printable/control characters
- Strip LaTeX commands and markup (e.g., \\section{...}, \\textbf{...}, $...$, \\begin{...} ... \\end{...})
- Normalize whitespace and newlines; collapse repeated punctuation
- Convert bullet symbols (•, -, ·, *) to a single dash "-" and ensure proper spacing
- Keep content meaning intact; do not hallucinate new info
- If a field is missing, return an empty string. Do not add extra fields.

Formatting requirements for cleaned_text:
- Organize into these sections if present (in order): "Summary", "Contact", "Skills", "Experience", "Projects", "Education", "Certifications", "Awards"
- Use Title Case section headings without extra decoration
- Use hyphen bullets ("- ") for lists; one item per line
- Place one blank line between sections; no trailing spaces
- Normalize dates to "Mon YYYY" (e.g., "Jan 2024"); use "Present" for ongoing roles
- Combine duplicate whitespace; keep lines under ~100 characters when reasonable
- Keep technology names in their common casing (e.g., Node.js, React, AWS)`

function sanitizeText(input: string): string {
  // Remove non-printable/control characters except tab/newline/carriage return, and common replacement char
  // Also strip a few frequent mojibake bytes that appear as odd glyphs in some PDFs
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ") // control chars
    .replace(/[\uFFFD\u0093\u0094\u0080-\u009F]/g, " ") // replacement char and C1 controls
    .replace(/[\u00A0]/g, " ") // non-breaking space -> space
    .replace(/\s{2,}/g, " ") // collapse whitespace
    .trim()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawTextOriginal = String(body?.rawText || "")
    const filename = String(body?.filename || "resume.pdf")

    if (!rawTextOriginal) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const rawText = sanitizeText(rawTextOriginal)

    // Quick heuristic parse first (use sanitized text)
    const heuristic = parseResumeFields(rawText)

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ filename, ...heuristic, rawText, cleanedText: rawText })
    }

    // Dynamic import so build doesn't fail if package missing
    // @ts-ignore - dynamic import at runtime
    let Groq: any
    try {
      const mod: any = await import("groq-sdk")
      Groq = mod.default || mod
    } catch {
      // SDK not installed; return heuristic only
      return NextResponse.json({ filename, ...heuristic, rawText, cleanedText: rawText })
    }

    const groq = new Groq({ apiKey })
    const userPrompt = `Extract fields from this resume text and provide a cleaned_text field. Respond ONLY with JSON.\n\nTEXT:\n${rawText}`

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" as any },
    })

    let ai: any
    try {
      const content = completion.choices?.[0]?.message?.content || "{}"
      ai = JSON.parse(content)
    } catch {
      ai = {}
    }

    const result = {
      filename,
      name: ai.name || heuristic.name || "",
      email: ai.email || heuristic.email || "",
      phone: ai.phone || heuristic.phone || "",
      skills: ai.skills || heuristic.skills || "",
      rawText,
      cleanedText: (ai.cleaned_text || ai.cleanedText || rawText),
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to refine", details: String(err?.message || err) }, { status: 500 })
  }
} 