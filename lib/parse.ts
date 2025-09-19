export function parseResumeFields(text: string): { name: string; email: string; phone: string; skills: string } {
	const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
	const PHONE_REGEX = /(?:(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4,6})/g

	const normalized = text.replace(/\u00A0/g, " ")
	const lines = normalized.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

	const emailMatch = normalized.match(EMAIL_REGEX)
	const email = emailMatch ? emailMatch[0] : ""

	const phoneCandidates = Array.from(normalized.matchAll(PHONE_REGEX)).map(m => m[0])
	const cleanedPhone = phoneCandidates
		.map(p => p.replace(/[^+\d]/g, ""))
		.find(p => p.length >= 10 && p.length <= 15) || ""

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