# AgriVance Software

AgriVance is a smart, all-in-one software platform designed to revolutionize the agricultural and manufacturing industries. It provides innovative solutions to enhance productivity, efficiency, and sustainability by bridging the gap between farm production and factory operations.

## Core Features

-   **Real-time Inventory Management:** Track raw materials, fertilizers, and finished goods with a live-updating table.
-   **Production Planning Calendar:** A collaborative, real-time calendar to schedule and track tasks like planting, harvesting, and maintenance.
-   **Supply Chain Tracking:** Visualize and monitor shipments from origin to destination on an interactive map.
-   **Interactive Dashboard:** A central hub featuring a weather forecast, a map of the selected farm location, and AI-powered planting suggestions.
-   **AI Virtual Assistant:** A powerful assistant powered by Google's Gemini AI. It can answer questions, fetch data from the inventory, and provide context-aware advice.
-   **Voice Control:** Interact with the AI assistant using voice commands.

## Tech Stack

-   **Frontend:** ReactJS with TypeScript, built using Vite.
-   **UI Library:** Material-UI (MUI) for a professional and consistent component library.
-   **Backend & Database:** Firebase (Firestore for database, Firebase Authentication for users).
-   **Mapping:** Leaflet with OpenStreetMap for a 100% free and interactive map solution.
-   **AI Model:** Google Gemini API for the virtual assistant and data analysis.
-   **Deployment:** Automated deployment to Firebase Hosting via GitHub Actions.

---

## Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   `npm` or `yarn` package manager
-   A code editor like [Visual Studio Code](https://code.visualstudio.com/)
-   A [Google Account](https://accounts.google.com/signup) for Firebase and Google AI services.

### Step 1: Clone the Repository

First, clone the project from GitHub to your local machine.

```bash
git https://github.com/Golgrax/AgriVance.git
cd AgriVance
```

### Step 2: Install Dependencies

Install all the necessary npm packages for the project to run.

```bash
npm install
```

### Step 3: Set Up Your Firebase Project

This application requires a Firebase project to handle the database and user authentication.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and create a new project named "AgriVance" (or a name of your choice).
3.  Once the project is created, go to **Build > Authentication** from the left-hand menu. Click "Get started" and enable the **Google** and **Email/Password** sign-in methods.
4.  Next, go to **Build > Firestore Database**. Click "Create database" and start in **test mode** for now. This allows easy read/write access during development.
5.  In your project's main page, click the `</>` (Web) icon to register a new web app. Give it a nickname and Firebase will provide you with a `firebaseConfig` object. You will need these keys for the next step.

### Step 4: Configure Environment Variables

This is the most critical step. You must provide your own API keys for the application to connect to its services.

1.  In the root of the project, create a new file named `.env.local`.
2.  Copy the contents of `.env.local.example` (if it exists) or use the template below and paste it into your new `.env.local` file.
3.  Fill in the values with your own keys obtained from the services.

**Template for `.env.local`:**
```
# Get these from your Firebase project settings (Step 3.5)
VITE_FIREBASE_API_KEY="apikey"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef123"
VITE_FIREBASE_MEASUREMENT_ID="G-ABCDEF123"

# Get this from Google AI Studio
VITE_GEMINI_API_KEY="googleaiapi"

# Get this from OpenWeatherMap
VITE_OPENWEATHERMAP_API_KEY="your-openweathermap-key"
```

**Where to find the keys:**
-   `VITE_FIREBASE_*`: From the `firebaseConfig` object in your Firebase project settings.
-   `VITE_GEMINI_API_KEY`: From [Google AI Studio](https://aistudio.google.com/).
-   `VITE_OPENWEATHERMAP_API_KEY`: From your account page on [OpenWeatherMap](https://openweathermap.org/).

### Step 5: Important Firestore Setup (For AI Search)

For the AI assistant's inventory search to work correctly with different cases (e.g., "corn", "Corn"), you must add a lowercase field to your inventory items.
When adding a new item, ensure you include a `name_lowercase` field:
```javascript
{
  name: "Corn Seeds",
  name_lowercase: "corn seeds", // <-- Add this field
  quantity: 50,
  // ... other fields
}
```

### Step 6: Run the Application

Once your `.env.local` file is configured, you can start the development server.

```bash
npm run dev
```

The application should now be running on `http://localhost:5173`.