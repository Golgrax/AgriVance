# AgriVance Software

**To revolutionize the agricultural and manufacturing industries through cutting-edge technology, providing innovative software solutions that enhance productivity, efficiency, and sustainability.**

This project is a web-based platform built with React and TypeScript, designed to be an all-in-one software solution that streamlines agricultural production, factory operations, and supply chain logistics. It leverages real-time data, mapping, and a powerful AI assistant to optimize resource management and improve decision-making.

**Live Demo:** [https://agrivance-bc8b1.web.app/](https://agrivance-bc8b1.web.app/)

---

## ✨ Key Features

*   **Real-time Inventory Management:** A full CRUD interface to track raw materials, equipment, and finished goods, backed by Firestore for live updates.
*   **Interactive Dashboard:** Features a central dashboard with:
    *   **Live Weather Forecasts:** Fetches and displays real-time weather from OpenWeatherMap for any location.
    *   **Dynamic Farm Map:** An interactive map powered by Leaflet and OpenStreetMap that visualizes farm locations and updates based on the weather search.
*   **Production Planning Calendar:** A shared, real-time team calendar built with FullCalendar to schedule and track tasks like planting, harvesting, and maintenance.
*   **Supply Chain Visualization:** A dedicated page to manage and track shipments from origin to destination, visualized on a live map with custom markers and routes.
*   **🤖 AI Virtual Assistant (Powered by Google Gemini):**
    *   **Natural Language Processing:** Understands and responds to user queries in plain English.
    *   **Context-Aware:** The AI is given a system prompt to keep its responses focused on agriculture, manufacturing, and logistics.
    *   **Function Calling:** Can query the live Firestore database to answer questions like, *"How much fertilizer do we have?"*
    *   **Data-Driven Suggestions:** Provides intelligent planting suggestions based on real-time weather data from the dashboard.
    *   **Voice-to-Text Input:** Supports voice commands via a microphone button using the Web Speech API.
    *   **Markdown Rendering:** Displays responses in a clean, formatted way.

## 📸 Screenshot

*(coming soon...)*

---

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Material-UI (MUI)
*   **Database & Auth:** Firebase (Firestore, Authentication)
*   **Mapping:** Leaflet & OpenStreetMap
*   **AI:** Google Gemini API
*   **External APIs:** OpenWeatherMap API
*   **Deployment:** Firebase Hosting with GitHub Actions for CI/CD

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later)
*   NPM
*   A Firebase account
*   An OpenWeatherMap API key
*   A Google AI (Gemini) API key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Golgrax/AgriVance.git
    cd AgriVance
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up your Environment Variables:**
    Create a file named `.env.local` in the root of the project and add your secret keys. Use the `.env.example` below as a template.

    `.env.local`
    ```
    # Get from your Firebase project settings
    VITE_FIREBASE_API_KEY="AIzaSy..."
    VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
    VITE_FIREBASE_PROJECT_ID="your-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
    VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
    VITE_FIREBASE_APP_ID="1:123456789:web:abcdef123"
    VITE_FIREBASE_MEASUREMENT_ID="G-ABCDEF123"

    # Get from the OpenWeatherMap website
    VITE_OPENWEATHERMAP_API_KEY="your-openweathermap-key"

    # Get from Google AI Studio
    VITE_GEMINI_API_KEY="your-gemini-api-key"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.
