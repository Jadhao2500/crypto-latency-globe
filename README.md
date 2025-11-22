# Crypto Latency Globe

Interactive Next.js demo that visualizes cryptocurrency exchange servers, cloud co-location regions, and real-time / historical latency on a 3D world map.

Built as a take-home assignment to showcase frontend architecture, data visualization, and 3D rendering.

---

## Features

### 3D World Map

- Interactive 3D globe using `react-globe.gl` (Three.js under the hood)
- Rotate, zoom, and pan with mouse or touch
- Smooth initial camera transition to a global view

### Exchange & Cloud Regions

- Major exchange server locations (Binance, OKX, Deribit, Bybit, etc.)
- Each exchange is mapped to a cloud region (AWS, GCP, Azure)
- Color-coded markers by cloud provider
- Tooltip on hover: exchange name, city, provider, region code
- Legend explaining markers and link colors
- Optional visualization of AWS / GCP / Azure regions on the globe

### Real-Time Latency

- Next.js API route `/api/latency` simulates latency between exchanges and cloud regions
- Polling every 5 seconds via a React context (`LatencyProvider`)
- Animated arcs on the globe representing latency links
- Color-coded latency:
  - Green: low latency
  - Yellow: medium
  - Red: high
- Easily swappable to a real free API (e.g. Cloudflare Radar) in `app/api/latency/route.ts`

### Historical Latency

- Time-series line chart built with `recharts`
- Uses the same latency samples collected from the polling context
- Time range selectors: **1h**, **24h**, **7d**
- Latency statistics: min, max, average for the selected range

### Controls & Filters

- Filter by cloud provider (AWS, GCP, Azure)
- Slider to filter by maximum latency
- Toggle layers:
  - Show/hide cloud regions
  - Show/hide real-time latency arcs
- Search box to quickly locate exchanges
- Simple performance status (polling interval, etc.)

### Theming

- Dark/light theme toggle in the header
- `darkMode: "class"` Tailwind configuration
- Theme stored in `localStorage` and respects system preference on first load

### Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Language**: TypeScript
- **State Management**: React hooks + Context
- **3D Globe**: `react-globe.gl` / Three.js
- **Charts**: `recharts`
- **Styling**: Tailwind CSS
- **Data**: Static config for exchanges & regions, simulated latency via API route

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open the app
# Visit http://localhost:3000
```
