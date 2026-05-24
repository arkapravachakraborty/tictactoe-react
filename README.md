# Tic Tac Toe

A gorgeous, high-fidelity, and feature-rich Tic Tac Toe application built with **React**, **TypeScript**, and **Tailwind CSS**. It is fully mobile-responsive, runs 100% scrollbar-free across all devices, and provides a polished glassmorphic interface with micro-animations and smart game modes.

---

## ✨ Features

- **🎮 Dual Game Modes**:
  - **Local PvP**: Smooth local multiplayer turn-taking.
  - **VS Computer (Smart AI)**: An unbeatable AI powered by a full **Minimax Decision Tree Algorithm** (on "Impossible" mode), and a randomized AI (on "Easy" mode).
- **🪙 Custom Symbol Selection**: Toggles your active playing symbol between **X** (Indigo) and **O** (Rose) when playing against the computer.
- **⚡ AI Opening Handlers**: Since X always starts first, if you choose to play as **O**, the AI automatically makes the opening move as **X** with a realistic computing latency!
- **📊 Integrated Turn-Indicator Scoreboard**:
  - Automatically tracks wins for Player X, wins for Player O, and Ties.
  - Features high-end **glowing board card indicators** that light up, scale, and pulse a colored active indicator dot (`animate-ping`) directly around the active player's tally card to show whose turn it is.
- **🎉 Victory Highlights & Custom Confetti**:
  - The winning three-in-a-row combination pulses with a glowing indigo or rose shadow (`animate-win-pulse-x` or `animate-win-pulse-o`).
  - Instantly fires a lightweight, pure CSS/React particle confetti shower on win states.
- **📱 Mobile Responsive & Zero-Scroll Layout**: Consolidated vertical spacings, headers, and dynamic settings items down to compact components, leaving ample space to fit beautifully large, comfortable buttons (`w-20` on mobile, `w-24` on desktop) completely scrollbar-free on any screen dimension.
- **🎨 Modern Custom Favicon**: Replaced default template logo with a high-fidelity vector favicon showing an overlapping Indigo **X** and Rose **O** resting on a bordered glassmorphic card.

---

## 🚀 Getting Started

### 1. Installation

Clone this repository and install the project dependencies inside the folder:

```bash
npm install
```

### 2. Run the Development Server

Start Vite's development server to play locally:

```bash
npm run dev
```

### 3. Build for Production

Compile the optimized bundle:

```bash
npm run build
```

---

## 🛠️ Technology Stack

- **Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS v4 + Vanilla CSS custom animations
- **Icons**: Custom inline, zero-bloat vector SVGs
- **Build Tool**: Vite
