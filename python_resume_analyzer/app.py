from flask import Flask, request, jsonify, send_from_directory, make_response
import pdfplumber
import re
import io
from typing import List, Dict, Any
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge

app = Flask(__name__, static_url_path='', static_folder='static')
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

# 5 MB limit
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

SKILLS = [
	"python","java","javascript","typescript","sql","c++","c#","go","golang","ruby","php",
	"react","angular","vue","node","node.js","django","flask","spring","fastapi",
	"aws","azure","gcp","docker","kubernetes","terraform",
	"postgresql","mysql","mongodb","redis","elasticsearch",
	"pandas","numpy","scikit-learn","pytorch","tensorflow",
]

EMAIL_REGEX = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+", re.IGNORECASE)
PHONE_REGEX = re.compile(r"(\+?\d{1,3}[\s-]?)?\d{10}")


def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
	text_parts: List[str] = []
	with pdfplumber.open(file_stream) as pdf:
		for page in pdf.pages:
			try:
				page_text = page.extract_text() or ""
				text_parts.append(page_text)
			except Exception:
				continue
	return "\n".join(text_parts)


def clean_text(raw: str) -> str:
	if not raw:
		return ""
	txt = raw.encode("utf-8", errors="ignore").decode("utf-8", errors="ignore")
	txt = txt.replace("\r\n", "\n").replace("\r", "\n")
	txt = re.sub(r"\t+", " ", txt)
	txt = "\n".join(re.sub(r"[ ]+", " ", line).strip() for line in txt.split("\n"))
	txt = re.sub(r"\n{3,}", "\n\n", txt)
	return txt.strip()


def extract_name(cleaned: str, email_hint: str = "") -> str:
	if not cleaned:
		return ""
	lines = [l.strip() for l in cleaned.split("\n") if l.strip()]
	label_words = {"resume","curriculum","vitae","cv","contact","email","phone","mobile","address","skills","experience","education","summary","objective","projects","certifications"}
	for line in lines[:30]:
		low = line.lower()
		if any(w in low for w in ("@","linkedin","github","www.")):
			continue
		if any(lbl in low for lbl in label_words):
			continue
		if len(line) > 60:
			continue
		if re.fullmatch(r"[A-Za-z][A-Za-z\.'\-\s]*[A-Za-z]", line) and len([w for w in line.split() if len(re.sub(r"[^A-Za-z]","", w))>=2]) >= 2:
			if not re.search(r"\d", line):
				return line
	if email_hint and "@" in email_hint:
		user = email_hint.split("@",1)[0]
		parts = re.split(r"[._\-]+", user)
		parts = [p for p in parts if p and p.isalpha()]
		if len(parts) >= 2:
			return " ".join(w.capitalize() for w in parts[:3])
	return ""


def extract_email(cleaned: str) -> str:
	match = EMAIL_REGEX.search(cleaned or "")
	return match.group(0) if match else ""


def extract_phone(cleaned: str) -> str:
	match = PHONE_REGEX.search(cleaned or "")
	if not match:
		return ""
	num = re.sub(r"[^\d+]", "", match.group(0))
	return num


def extract_skills(cleaned: str) -> List[str]:
	found = set()
	lower = (cleaned or "").lower()
	for skill in SKILLS:
		pattern = r"(?<![a-z0-9])" + re.escape(skill.lower()) + r"(?![a-z0-9])"
		if re.search(pattern, lower):
			found.add(skill if any(c.isupper() for c in skill) else skill.title() if skill in {"c++","c#"} else skill.capitalize())
	normalize = {
		"node": "Node.js",
		"node.js": "Node.js",
		"aws": "AWS",
		"gcp": "GCP",
		"sql": "SQL",
	}
	return [normalize.get(s.lower(), s) for s in sorted(found, key=str.lower)]


def parse_fields(filename: str, cleaned_text: str) -> Dict[str, Any]:
	email = extract_email(cleaned_text)
	name = extract_name(cleaned_text, email)
	phone = extract_phone(cleaned_text)
	skills = extract_skills(cleaned_text)
	return {
		"filename": filename,
		"name": name or None,
		"email": email or None,
		"phone": phone or None,
		"skills": skills if skills else None,
	}


@app.after_request
def add_cors_headers(response):
	response.headers['Access-Control-Allow-Origin'] = '*'
	response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
	response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
	return response


@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
	return jsonify({"error": "File too large. Max 5 MB."}), 413


@app.route('/analyze', methods=['POST','OPTIONS'])
def analyze():
	if request.method == 'OPTIONS':
		resp = make_response('', 204)
		resp.headers['Access-Control-Allow-Origin'] = '*'
		resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
		resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
		return resp
	if 'file' not in request.files:
		return jsonify({"error": "No file provided"}), 400
	# Explicit size check (in case reverse proxies bypass MAX_CONTENT_LENGTH)
	max_bytes = 5 * 1024 * 1024
	if request.content_length and request.content_length > max_bytes:
		return jsonify({"error": "File too large. Max 5 MB."}), 413
	f = request.files['file']
	# Strict format validation: only PDFs are allowed
	filename = (f.filename or "").lower()
	content_type = (f.mimetype or "").lower()
	if not filename.endswith('.pdf') and 'pdf' not in content_type:
		return jsonify({"error": "Invalid format. Only PDF files are supported."}), 400
	try:
		stream = io.BytesIO(f.read())
		if stream.getbuffer().nbytes == 0:
			return jsonify({"error": "Empty file."}), 400
		if stream.getbuffer().nbytes > max_bytes:
			return jsonify({"error": "File too large. Max 5 MB."}), 413
		raw = extract_text_from_pdf(stream)
	except Exception as e:
		return jsonify({"error": "Failed to read PDF.", "details": str(e)}), 400
	cleaned = clean_text(raw)
	fields = parse_fields(f.filename, cleaned)
	return jsonify({
		"filename": fields["filename"],
		"name": fields["name"],
		"email": fields["email"],
		"phone": fields["phone"],
		"skills": fields["skills"],
		"rawText": cleaned or None,
	})


@app.get('/')
def index():
	return send_from_directory(app.static_folder, 'index.html')


@app.get('/<path:path>')
def static_proxy(path):
	return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5001, debug=True) 