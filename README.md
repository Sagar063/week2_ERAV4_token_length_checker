# Token Length Checker — Plus

Space-split token counter with extra stats and visuals.

## Features
- **Baseline**: Live JS token count and `/api/count` (Flask)
- **Stats** (`/api/stats`):
  - Average word length, unique words, sentence & paragraph count
  - Most frequent words (Top 5, ignoring stopwords)
  - Reading time estimate (200 wpm)
  - Longest / Shortest word
- **UI**:
  - Color-coded tokens (long words > 7 chars)
  - Word cloud (wordcloud2.js via CDN)
  - Top 5 frequency bar chart (Chart.js via CDN)
  - Stopword removal toggle
  - Download JSON/CSV exports
  - Copy tokens to clipboard
  - Dark/Light theme toggle

## Run locally
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000

## Deploy (EC2 quick)
```bash
sudo apt-get update -y
sudo apt-get install -y python3 python3-venv python3-pip git
git clone https://github.com/Sagar063/week2_ERAV4_token_length_checker.git
cd week2_ERAV4_token_length_checker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py     # or: pip install gunicorn && gunicorn -b 0.0.0.0:5000 app:app
```

## Notes
- Tokenization uses **simple whitespace split** to match assignment.
- Frequency & stats use lowercased, punctuation-trimmed tokens; optional stopword removal.
