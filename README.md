# 🎰 CloverCadia

**A retro-style web slot machine game with pixel art aesthetics and chiptune sounds.**

[🇰🇷 한국어](./README.ko.md)

---

## 🎮 Play Now

👉 **[Play CloverCadia](https://clover-cadia.vercel.app)**

---

## ✨ Features

### 🎲 5×3 Slot Grid
- 15-cell grid with 7 paylines (horizontal + diagonal)
- Weighted symbol probabilities for balanced gameplay

### 🍀 Symbols & Odds
| Symbol | Name | Probability | Payout |
|--------|------|-------------|--------|
| 🍒🍋 | Cherry / Lemon | 19.4% | 2x |
| ☘️🔔 | Clover / Bell | 14.9% | 5x |
| 💎💰 | Diamond / Treasure | 11.9% | 10x |
| 7️⃣ | Lucky Seven | 7.5% | 25x |
| 6️⃣ | Curse | 1.5% | ☠️ |

### ☠️ The 666 Curse
> *When three 6s appear... you lose everything.*

Hit 666 and watch your coins vanish! But don't worry—the **Holy Shield** item can protect you.

### 🛒 Item Shop
| Item | Effect |
|------|--------|
| 🍀 Lucky Charm | +Clover probability for 3 spins |
| ⭐ Double Star | 2x winnings on next win |
| 🔥 Hot Streak | +5 bonus spins |
| ✝️ Holy Shield | Block the 666 curse |
| 🃏 Wild Card | Add wild symbol to grid |

### 🏆 Achievements
Unlock 8 achievements including:
- 🏆 First Win
- 7️⃣ Lucky Seven (hit 7×3)
- 💎 Jackpot Hunter (hit 7×5)
- 😈 Cursed (trigger 666)
- ✝️ Survivor (block 666 with shield)

### 🌍 Bilingual Support
Switch between **English** and **Korean** with one click!

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: 8bitcn/ui + Tailwind CSS
- **Audio**: Web Audio API (Chiptune engine)
- **Font**: Press Start 2P
- **Storage**: localStorage
- **Deploy**: Vercel

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/coincidence-one/clover-cadia.git
cd clover-cadia

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and spin!

---

## 📜 License

MIT License © 2024

---

<p align="center">
  <strong>🎰 Spin the reels. Chase the jackpot. Fear the 666. 🎰</strong>
</p>
