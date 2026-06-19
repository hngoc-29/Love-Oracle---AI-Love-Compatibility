# 🔮 Love Oracle

<p align="center">
  <img src="./public/favicon.png" width="120" alt="Love Oracle Logo"/>
</p>

<p align="center">
  AI-powered mystical love compatibility analyzer ✨💖
</p>

---

## 🌟 Introduction

**Love Oracle** is a modern AI-powered love fortune teller that analyzes the compatibility between two people based on their names and birth dates.

The application combines deterministic algorithms with AI-generated prophecies to create unique, magical, and entertaining love readings.

⚠️ **For entertainment purposes only. This application does not provide scientific predictions about relationships or the future.**

---

## ✨ Features

### 💞 Love Compatibility Analysis

* Analyze compatibility score (0 - 100)
* Calculate personality traits
* Determine mystical elements
* Generate lucky colors and symbols
* Create relationship insights

### 🤖 AI Love Prophecy

* Generate unique love prophecies using AI
* Multiple prophecy styles:

  * 🌹 Romantic
  * 😂 Funny
  * 🌙 Mysterious
  * 💡 Wise

### 💌 AI Love Letter

* Generate personalized love letters
* Different emotional tones
* Real-time typing animation

### ⚡ Performance Optimization

* Cloudflare KV cache for AI results
* Prevent repeated expensive AI requests
* In-memory rate limiting
* Fast serverless deployment on Vercel

### 🎨 Modern UI

* Responsive design
* Smooth animations with Framer Motion
* Magical gradient effects
* Custom favicon and branding

---

## 🛠️ Tech Stack

### Frontend

* Next.js 16 (App Router)
* React 19
* Tailwind CSS 4
* Framer Motion

### Backend

* Next.js Server Actions & API Routes
* Vercel Serverless Functions

### AI Providers

* Groq API
* Google Gemini API
* Local fallback generator

### Storage & Cache

* Cloudflare KV (distributed cache)
* Memory Map (rate limit)

---

## 🏗️ Architecture

```text
                 User
                  |
                  |
             Next.js App
            (Vercel Edge)
                  |
        +---------+---------+
        |                   |
        v                   v
 Cloudflare KV          Rate Limit
    Cache               Memory Map
        |
        v
  Groq / Gemini AI
```

---

## 📦 Installation

### Clone the repository

```bash
git clone https://github.com/hngoc-29/Love-Oracle---AI-Love-Compatibility.git love-oracle
cd love-oracle
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create `.env.local`:

```env
# AI API Keys
GROQ_API_KEY=

GEMINI_API_KEY=

# Cloudflare KV
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_KV_NAMESPACE_ID=
CLOUDFLARE_API_TOKEN=
```

### Run development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📁 Project Structure

```text
app/
├── api/
│   ├── love-analysis/
│   └── love-letter/
│
├── page.js

components/
├── LoveForm.jsx
├── ResultCard.jsx
├── LoveLetterModal.jsx

lib/
├── love-engine.js
├── ai-writer.js
├── cloudflare-kv.js
├── hash.js
└── data/
```

---

## 🔥 API Response Example

### New AI generated result

```json
{
  "analysis": {},
  "prophecy": "The stars have aligned...",
  "advice": "Trust your feelings.",
  "source": "ai"
}
```

### Cached result

```json
{
  "analysis": {},
  "prophecy": "The stars have aligned...",
  "advice": "Trust your feelings.",
  "source": "cache"
}
```

---

## 🚀 Deployment

### Vercel

1. Push your project to GitHub
2. Import the repository into Vercel
3. Configure environment variables
4. Deploy

The application is optimized for Vercel serverless architecture.

---

## 🔐 Environment Variables

| Variable                     | Description           |
| ---------------------------- | --------------------- |
| `GROQ_API_KEY`               | Groq AI API key       |
| `GEMINI_API_KEY`             | Gemini AI API key     |
| `CLOUDFLARE_ACCOUNT_ID`      | Cloudflare account ID |
| `CLOUDFLARE_KV_NAMESPACE_ID` | KV namespace ID       |
| `CLOUDFLARE_API_TOKEN`       | Cloudflare API token  |

---

## 📈 Future Improvements

* User accounts
* Save love history
* Shareable love cards
* More AI personalities
* More languages

---

## 📄 License

MIT License

---

<p align="center">
Made with ❤️, ✨ and a little bit of magic 🔮
</p>
