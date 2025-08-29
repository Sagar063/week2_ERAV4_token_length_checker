from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def simple_tokenize(text: str):
    tokens = [t for t in text.split() if t.strip() != ""]
    return tokens

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/count", methods=["POST"])
def count_tokens():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    tokens = simple_tokenize(text)
    return jsonify({"count": len(tokens), "tokens": tokens})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
