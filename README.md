# Token Length Checker

A simple Flask + HTML/CSS/JS app that counts tokens (words) in a paragraph.  
Tokens are counted by splitting on spaces (very simple rule).

## Features
- Frontend (HTML/CSS/JS):
  - Textarea to paste text
  - Live token count (in browser, JavaScript split)
  - API token count (via Flask backend)
- Backend (Flask):
  - `/api/count` endpoint accepts text and returns token count + token list
- Lightweight, no database

## Run Locally
```bash
# clone repo
git clone git@github.com:<your-username>/week2_ERAV4_token_length_checker.git
cd week2_ERAV4_token_length_checker

# create virtual environment
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# run server
python app.py
```
Visit: http://127.0.0.1:5000

## Deployment
This app can be deployed to AWS EC2 (or any VPS).  
Steps:
1. SSH into EC2  
2. Install Python 3 & pip  
3. Clone this repo  
4. Install requirements  
5. Run with `python app.py` (or with `gunicorn` for production)

## Example
Input:
```
Machine learning enables computers to learn from data.
```
Output: **7 tokens**

---
Built as part of ERA V4 Week 2 Assignment 🚀
