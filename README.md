# 🌱 EcoLens — AI Retail Sustainability Assistant

**EcoLens** is a production-ready React Native Expo application designed for conscious retail consumers in India. It empowers shoppers to photo scan product packaging directly with their smartphone camera, evaluate true life-cycle impact, detect greenwashing, and discover cleaner, local Indian alternatives.

---

## 📱 Mobile Architecture & Key Features

- **Product Photo-Scanning Architecture**: Direct camera viewfinder with emerald target reticle and laser sweep animation. Identifies brand, packaging materials (HDPE, multi-layer BoPP, paperboard, glass, tin), and CPCB EPR compliance directly from photos.
- **Pure Light Eco Theme**: High-contrast, clean aesthetic featuring crisp white containers, soft slate backgrounds (`#f8fafc`), emerald greens (`#059669`), and pink priority accents (`#ec4899`).
- **5-Pillar Sustainability Breakdown**:
  1. **Packaging & Plastic**: Evaluates true recyclability in Indian municipal scrap systems (*Kabadiwala*).
  2. **Carbon Pollution**: Detects solar drying, rail freight, and local logistics vs. heavy maritime imports.
  3. **Vegan & Cruelty-Free**: Verifies plant-based formulations and animal testing status.
  4. **Fair Worker Pay**: Validates fair compensation for rural weavers, tea garden workers, and village dairy farmers.
  5. **Made in India**: Distinguishes locally sourced ingredients from imported raw materials.
- **Real-Time Google Search Grounding**: Integrates live Google Search data to detect recent greenwashing controversies, ASCI complaints, and updated CPCB EPR filings.
- **Dynamic AI Personalization**: AI explanations adapt in real time to the user's active sustainability priorities.
- **Cleaner Eco Swaps**: Ranked sustainable alternatives with calculated percentage impact reductions.
- **EcoLens Pro Tier**: Freemium upgrade flow with life-cycle assessments (Scope 1, 2, 3 GHG), quick-commerce cart audits, and offline caching.

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npx expo`) or Expo Go app on iOS / Android

### 1. Installation
```bash
npm install
```

### 2. Configure Environment
Set your Gemini API key in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Launch the App
Run the Expo development server:
```bash
# Start Expo interactive CLI
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Run on Web browser
npm run web
```

---

## 📂 Project Structure

```
├── App.tsx                     # Root application container & navigation router
├── app.json                    # Expo configuration & camera permissions
├── index.js                    # Expo entry registration
├── babel.config.js             # Babel preset configuration
├── package.json                # Dependencies & scripts
├── server.ts                   # Express backend for Gemini multimodal & Search Grounding
└── src/
    ├── components/
    │   ├── AppHeader.tsx           # Brand header with priorities horizontal scroll
    │   ├── BottomTabBar.tsx        # 5-slot navigation dock with central camera FAB
    │   ├── CameraScannerModal.tsx  # Expo camera viewfinder, gallery picker & test samples
    │   ├── DrawerMenu.tsx          # Slide-over drawer with quick jump & watchlist
    │   ├── GreenwashingRadar.tsx   # Rose alert box for deceptive claims
    │   ├── LiveWebAuditCard.tsx    # Google Search grounding live audit with citations
    │   ├── PillarCard.tsx          # 5-pillar sustainability card
    │   ├── PreferenceToggleRow.tsx # iOS/Android switch rows for eco priorities
    │   ├── ProductCard.tsx         # Standardized mathematically aligned product card
    │   └── ProModal.tsx            # EcoLens Pro subscription modal
    ├── data/
    │   └── mockProducts.ts         # Indian retail catalog (Mamaearth, Tata Tea, etc.)
    ├── screens/
    │   ├── HomeScreen.tsx          # Search bar, category filter pills, catalog grid
    │   ├── AuditScreen.tsx         # Detailed sustainability breakdown & hero card
    │   ├── SwapsScreen.tsx         # Ranked greener alternatives with impact savings
    │   └── PreferencesScreen.tsx   # Consumer priorities customization & Pro banner
    ├── services/
    │   └── geminiService.ts        # Multimodal camera photo analysis & search grounding
    ├── theme/
    │   └── colors.ts               # Color tokens & traffic badge styling helpers
    └── types/
        └── index.ts                # TypeScript interfaces & types
```

---

## 📄 Permissions

EcoLens requests the following native permissions on iOS and Android:
- **Camera (`NSCameraUsageDescription` / `CAMERA`)**: To take photos of retail product packaging.
- **Photo Gallery (`NSPhotoLibraryUsageDescription` / `READ_EXTERNAL_STORAGE`)**: To select packaging photos for sustainability analysis.