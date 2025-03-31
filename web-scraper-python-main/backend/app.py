from flask import Flask, request, jsonify
import re
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from duckduckgo_search import DDGS  # Corrected import
import google.generativeai as genai  # Using Gemini API for LLM-based text processing
from dotenv import load_dotenv
import os
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow all origins
load_dotenv()  # Load environment variables from .env

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Function to classify user input
def classify_input(user_text):
    url_pattern = re.compile(r'https?://\S+')
    youtube_pattern = re.compile(r'(https?://)?(www\.)?(youtube\.com|youtu\.?be)/.+')

    urls = url_pattern.findall(user_text)
    youtube_links = [url for url in urls if youtube_pattern.match(url)]

    if youtube_links:
        return {"type": "youtube", "links": youtube_links}
    elif urls:
        return {"type": "web", "links": urls}
    else:
        return {"type": "search", "query": user_text}

# Web Scraper
def scrape_website(url):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return "Failed to retrieve page"
        
        soup = BeautifulSoup(response.text, 'html.parser')
        paragraphs = soup.find_all('p')
        text = '\n'.join([p.get_text() for p in paragraphs])
        return text[:5000]  # Limit text size
    except Exception as e:
        return f"Scraping error: {str(e)}"

# YouTube Transcript Extractor
def get_youtube_transcript(url):
    video_id = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11})", url)
    if not video_id:
        return "Invalid YouTube URL"
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id.group(1))
        return ' '.join([t['text'] for t in transcript])
    except:
        return "Transcript not available"

# Web Search & Scrape (Improved)
def search_web(query):
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=3))  # Get up to 3 results

    valid_content = []
    for res in results:
        if 'href' in res:
            content = scrape_website(res['href'])
            if content and "Failed" not in content:
                valid_content.append(content)
    
    if valid_content:
        return "\n".join(valid_content[:2])  # Combine max 2 sources
    
    return "No valid links found"

# LLM Processing with Gemini
def process_with_gemini(text):
    model = genai.GenerativeModel("gemini-2.0-flash")
    try:
        response = model.generate_content(text)
        return response.text if response else "Failed to process with LLM"
    except Exception as e:
        return f"Error with Gemini API: {str(e)}"

@app.route('/process', methods=['POST'])
def process_input():
    user_text = request.json.get('text', '').strip()
    
    if not user_text:
        return jsonify({"summary": "Error: Empty input received"}), 400

    classification = classify_input(user_text)

    if classification["type"] == "web":
        content = scrape_website(classification["links"][0])
    elif classification["type"] == "youtube":
        content = get_youtube_transcript(classification["links"][0])
    else:
        content = search_web(classification["query"])
        
        # If search fails, ask Gemini directly
        if not content or content.startswith("No valid links found"):
            content = f"Answer this question: {user_text}"

    processed_text = process_with_gemini(content)

    return jsonify({"summary": processed_text})

if __name__ == '__main__':
    app.run(debug=True)
