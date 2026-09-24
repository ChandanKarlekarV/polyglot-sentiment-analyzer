# UI/UX Design System: The Vintage Diary Telemetry Journal

## 1. Core Design Philosophy
To ensure the interface feels intentional, tactile, and human-crafted, the UI rejects generic AI SaaS aesthetics (such as default Tailwind blues, purples, soft floating drop shadows, and oversized pill buttons). The visual system operates as an **analog ledger / vintage journal**, grounding modern real-time AI telemetry in aged paper and field dispatch tones.

---

## 2. Color Palette Tokens

| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| **`ledger-black`** | `#141210` | Primary application background (warm deep black) |
| **`ledger-panel`** | `#1a1715` | Elevated component and card surface |
| **`ledger-border`** | `#3e3832` | Hard 1px component separation border |
| **`ledger-text-main`** | `#ece8e1` | High-contrast warm off-white typography |
| **`ledger-text-muted`**| `#8c8273` | Secondary metadata, timestamps, and service paths |
| **`ledger-accent`** | `#F9A826` | Striking golden-orange for critical alerts and active status |
| **`ledger-accent-muted`** | `#a66c0d` | Secondary warm amber borders and hover states |

> **STRICT RULE:** Absolutely NO default Tailwind blue, indigo, or purple.

---

## 3. Surface & Texture

* **Borders over Shadows:** All dashboard panels use hard `1px solid #3e3832` borders. Soft rounded drop-shadows are strictly disabled (`box-shadow: none !important`).
* **CSS Film Grain:** A fixed, full-viewport SVG fractal noise overlay (`mix-blend-mode: overlay`, `opacity: 0.04`) is applied across the application body to provide a tactile paper grain texture.
* **Selection Highlighting:** Text selection uses golden-orange background (`#f9a826`) with deep black text (`#141210`).

---

## 4. Typography Hierarchy

1. **Headings & Ledger Titles:** Elegant Serif font (`Playfair Display`, `Newsreader`, `Georgia`) to evoke the feel of a vintage bound journal.
2. **Telemetry Logs & Code:** Crisp Monospace font (`JetBrains Mono`, `Fira Code`) for live timestamps, sentiment classes, and payload strings.
3. **Body Text:** Highly readable sans-serif (`Inter`, `system-ui`) with comfortable line height.

---

## 5. Active Services & Dossier Requirements

The UI's **"Active Services"** panel and **"Author Dossier"** must strictly present the 4 approved stack languages:
* **Gateway:** Java 17 / Spring Boot
* **AI Core:** Python 3.11 / Scikit-Learn
* **Preprocessor:** C++ 17 / MongoDB
* **Frontend:** JavaScript / Next.js 14
* **Databases:** SQL (Supabase PostgreSQL) & NoSQL (MongoDB)
