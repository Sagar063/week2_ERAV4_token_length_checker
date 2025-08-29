from flask import Flask, render_template, request, jsonify, make_response
import csv
import io
import re
from collections import Counter

app = Flask(__name__)

# Basic English stopwords (small set)
STOPWORDS = {
    "a","an","the","and","or","but","if","else","is","am","are","was","were","be","being","been",
    "to","of","in","for","on","with","as","by","at","from","that","this","it","its","into","than"
}

PUNCT_RE = re.compile(r"^[\W_]+|[\W_]+$")

def simple_tokenize(text: str):
    return [t for t in text.split() if t.strip() != ""]

def normalize_token(tok: str):
    # lower + trim leading/trailing punctuation for stats
    return PUNCT_RE.sub("", tok.lower())

def compute_stats(text: str, remove_stopwords: bool = False):
    raw_tokens = simple_tokenize(text)
    # normalized for counting/frequency
    norm_tokens = [normalize_token(t) for t in raw_tokens]
    norm_tokens = [t for t in norm_tokens if t]  # drop empty after stripping punctuation

    # Apply stopword removal for stats if chosen
    tokens_for_stats = [t for t in norm_tokens if (t not in STOPWORDS)] if remove_stopwords else norm_tokens

    word_count = len(tokens_for_stats)
    char_count = sum(len(t) for t in tokens_for_stats)
    sentence_count = len([s for s in re.split(r"[.!?]+", text) if s.strip()])
    paragraph_count = len([p for p in re.split(r"(?:\r?\n){2,}", text) if p.strip()])
    unique_count = len(set(tokens_for_stats))
    avg_word_length = (char_count / word_count) if word_count else 0.0
    reading_time_minutes = (word_count / 200.0) if word_count else 0.0

    # frequency
    freq = Counter(tokens_for_stats)
    top5 = freq.most_common(5)

    # longest/shortest words (prefer tokens_for_stats, fallback to norm_tokens)
    base_list = tokens_for_stats if tokens_for_stats else norm_tokens
    longest = max(base_list, key=len) if base_list else ""
    shortest = min([t for t in base_list if t], key=len) if base_list else ""

    return {
        "word_count": word_count,
        "char_count": char_count,
        "sentence_count": sentence_count,
        "paragraph_count": paragraph_count,
        "unique_words": unique_count,
        "avg_word_length": round(avg_word_length, 3),
        "reading_time_minutes": round(reading_time_minutes, 3),
        "top5": top5,
        "longest_word": longest,
        "shortest_word": shortest,
        "raw_tokens": raw_tokens,   # original tokens for UI coloring
        "norm_tokens": norm_tokens, # normalized tokens (lower/trim punct)
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/count", methods=["POST"])
def count_tokens():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    tokens = simple_tokenize(text)
    return jsonify({"count": len(tokens), "tokens": tokens})

@app.route("/api/stats", methods=["POST"])
def stats():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    remove_stop = bool(data.get("remove_stopwords", False))
    stats = compute_stats(text, remove_stopwords=remove_stop)
    return jsonify(stats)

@app.route("/api/export", methods=["POST"])
def export():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    remove_stop = bool(data.get("remove_stopwords", False))
    fmt = (data.get("format") or "json").lower()

    stats = compute_stats(text, remove_stopwords=remove_stop)

    if fmt == "csv":
        # CSV with key,value rows + frequencies
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["metric","value"])
        writer.writerow(["word_count", stats["word_count"]])
        writer.writerow(["char_count", stats["char_count"]])
        writer.writerow(["sentence_count", stats["sentence_count"]])
        writer.writerow(["paragraph_count", stats["paragraph_count"]])
        writer.writerow(["unique_words", stats["unique_words"]])
        writer.writerow(["avg_word_length", stats["avg_word_length"]])
        writer.writerow(["reading_time_minutes", stats["reading_time_minutes"]])
        writer.writerow(["longest_word", stats["longest_word"]])
        writer.writerow(["shortest_word", stats["shortest_word"]])
        writer.writerow([])
        writer.writerow(["word","count"])
        for w,c in stats["top5"]:
            writer.writerow([w,c])
        csv_data = output.getvalue()
        resp = make_response(csv_data)
        resp.headers["Content-Type"] = "text/csv"
        resp.headers["Content-Disposition"] = "attachment; filename=stats.csv"
        return resp

    # default JSON
    resp = make_response(json.dumps(stats, ensure_ascii=False, indent=2))
    resp.headers["Content-Type"] = "application/json; charset=utf-8"
    resp.headers["Content-Disposition"] = "attachment; filename=stats.json"
    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
