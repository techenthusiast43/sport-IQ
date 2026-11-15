# ⚽ SportIQ — Sports Betting AI Assistant & Universal Code Bridge

> **100% Free • Live AI v2.5 • Zero Paywalls • Unrestricted Access**

**SportIQ** is a modern, dark-mode-first fintech sports analytics web application and Telegram bot that seamlessly bridges booking codes across major sportsbooks (SportyBet, Bet9ja, 1xBet, MSport, BetKing), audits ticket risk using normalized AI survival scoring, and optimizes or generates accumulators grounded in real-time upcoming football fixtures and verified European sportsbook odds.

---

## 🌟 Key Features

### 🔄 1. Universal Code Bridge
- **Cross-Bookmaker Translation**: Convert booking codes between **SportyBet**, **Bet9ja**, **1xBet**, **MSport**, and **BetKing**.
- **Live SportyBet Integration**: Directly fetches and parses live Nigeria SportyBet ticket shares via server-side reverse proxy with browser-like headers.
- **Canonical Mapping Engine (`lib/bookmakerMapper.ts`)**: Normalizes team aliases (e.g. *Man City*, *Manchester City FC*, *MCFC*) and markets (`1X2`, `Double Chance`, `Over/Under 2.5`, `Both Teams To Score`).

### 🤖 2. Grounded AI Slip Copilot
- **Live Gemini Structured Outputs**: Powered by `@google/genai` (Gemini 2.5 / 3.6 / 3.8 Flash) with a resilient model cascade and strict JSON Schema validation.
- **Real-World Grounding (`lib/sportsData.ts`)**: Match suggestions and parlay generation are strictly grounded in upcoming European football fixtures (Premier League, La Liga, Serie A, Bundesliga, Champions League) fetched from [The Odds API](https://the-odds-api.com/).
- **Smart Natural Language Optimization**: Prune high-risk legs, convert 1X2 selections into safe Double Chance (1X/X2) variants, swap teams, adjust stake, or generate accumulators targeted to specific odds thresholds (e.g., *"Build me a safe 4-odds weekend parlay"*).

### 🛡️ 3. AI Survival Score & Risk Analytics (`lib/survivalScore.ts`)
- **Normalized Implied Probability**: Translates bookmaker decimal margins into true win probabilities and weights leg risk levels (🟢 Low, 🟡 Medium, 🔴 High) with contextual rationales.
- **Before vs. After Optimization Delta**: Interactive pill displays the exact survival score shift (e.g., `18% → 58% (+40%)`) with a 1-click revert capability.

### 💾 4. Saved Slips Vault (`components/SavedSlipsDrawer.tsx`)
- Store tickets locally in `localStorage` (`sportiq_saved_slips`) with total odds, stake, bookmaker route, and timestamp.
- Slide-over drawer with 1-click restoration into the active editor or quick deletion.

### 📤 5. Shareable Slip Receipts (`components/ShareSlipModal.tsx`)
- **Hi-Res PNG Export**: Client-side HTML5 Canvas receipt generator that renders dark-mode ticket cards with gradient accents and dynamic booking codes for download (`SportIQ-Slip-[CODE].png`).
- **One-Click Social Sharing**: Formatted Markdown messages ready for WhatsApp groups and Telegram chats.

### 📱 6. Telegram Bot Webhook (`app/api/telegram/webhook/route.ts`)
- **Bi-Directional Bot**: Connect your Telegram Bot to the SportIQ engine.
- **/start & /help**: Interactive onboarding guide.
- **Instant Code Detection**: Detects booking codes automatically and replies with the converted code and leg-by-leg risk flags.
- **Conversational Parlay Generator**: Generates grounded parlays on-demand directly inside Telegram chat.
- **Built-in Web Simulator**: Test Telegram bot interactions directly from the web dashboard.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (Fintech Slate-950 Dark Mode) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **AI Engine** | [Google Gemini Flash](https://aistudio.google.com/) via `@google/genai` |
| **Odds & Fixtures Feed** | [The Odds API v4](https://the-odds-api.com/) with in-memory TTL caching |
| **Platform Tier** | 100% Free Open Platform (No paywalls, credits, or subscriptions) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.18.0 or newer recommended, tested on Node v20 & v24)
- **npm**, **pnpm**, or **yarn**

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/sportiq.git
cd sportiq
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory (refer to `.env.example`):

```bash
cp .env.example .env.local
```

Populate the keys:
```env
# SportIQ Sports Betting AI Assistant & Universal Code Bridge

# Google Gemini API key from https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# The Odds API key for live European football fixtures from https://the-odds-api.com/
ODDS_API_KEY=your_odds_api_key_here

# Telegram Bot Token from https://t.me/BotFather
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Optional secret for Telegram Webhook validation
TELEGRAM_WEBHOOK_SECRET=optional_secret_token
```

> **Note on Fallbacks**: If any API key is left blank, SportIQ automatically engages graceful local fallbacks (Demo Mode heuristics and rich European fixture fixtures) so the application remains fully functional.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/booking-code` | Parses SportyBet/cross-bookmaker codes and generates translated tickets. |
| `POST` | `/api/ai-slip` | Grounded AI copilot optimizing or generating slips using Gemini structured outputs. |
| `GET` | `/api/fixtures` | Returns upcoming European fixtures with decimal odds (`?refresh=true` to force bypass cache). |
| `GET` | `/api/telegram/webhook` | Health check endpoint returning webhook status and configuration state. |
| `POST` | `/api/telegram/webhook` | Telegram webhook receiver handling user commands, code conversion, and parlay queries. |

---

## 🤖 Telegram Bot Webhook Setup

To deploy your live Telegram bot with SportIQ:

1. **Create Bot**: Talk to [@BotFather](https://t.me/BotFather) on Telegram and run `/newbot` to obtain your `TELEGRAM_BOT_TOKEN`.
2. **Deploy SportIQ**: Deploy your project to Vercel (or expose your local port with `ngrok http 3000`).
3. **Register Webhook**:
   Run the following `curl` command (or paste into your browser):
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<YOUR_DEPLOYED_DOMAIN>/api/telegram/webhook"
   ```
4. **Verify Health**:
   Visit `https://<YOUR_DEPLOYED_DOMAIN>/api/telegram/webhook`. It will return:
   ```json
   {
     "status": "ready",
     "service": "SportIQ Telegram Webhook Engine",
     "botConfigured": true
   }
   ```
5. **Start Chatting**: Open your bot in Telegram and send `/start`, paste any booking code like `SB-8924A`, or request a slip like *"Build a safe 3-odds weekend parlay"*.

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com/new) and import your repository.
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY`
   - `ODDS_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET` (optional)
4. Click **Deploy**. Vercel will automatically build and deploy the Next.js application.

---

## ⚖️ Responsible Gambling Disclaimer

> **18+ • Responsible Gambling Notice**  
> SportIQ AI analytics, survival scores, and booking code conversions are informational tools designed solely for statistical modeling and entertainment. SportIQ does not provide financial advice or guarantee bet outcomes. Sports betting carries financial risk; never wager more than you can afford to lose. Please gamble responsibly.
