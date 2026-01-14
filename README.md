<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Explicandum (Frontend)

Explicandum is a sophisticated reasoning interface designed for deep logical and philosophical analysis. This repository contains the **Frontend UI**, which features a high-fidelity "investigator" theme, multi-agent thought visualization, and document management. It is developed by Gemini 3 Flash.

### 🧠 System Architecture
This frontend is designed to work in tandem with the **Explicandum Brain** (FastAPI backend). It uses a decoupled architecture where the UI handles state management, streaming rendering, and user interactions, while the backend handles heavy AI reasoning and RAG.

### ✨ Key Features
*   **Multi-Agent Visualization**: Distinct interfaces for Logic Analyst and Philosophy Expert agents.
*   **Stance Memory**: Visual library for extracted user philosophical stances.
*   **RAG Interface**: Document upload and source citation display.
*   **Admin Dashboard**: Built-in interface for user quota and system monitoring.
*   **Resource Tracking**: Real-time token usage visualization.

## 🚀 Getting Started

**Prerequisites:**  Node.js (v18+)

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure API Connection:**
    Ensure your [Explicandum Core](https://github.com/zouzh14/explicandum-core) backend is running. By default, this frontend connects to `http://localhost:8000`. You can modify this in `services/geminiService.ts`.

3.  **Run the app:**
    ```bash
    npm run dev
    ```

## 🛠 Tech Stack
*   **Framework**: React 19 + TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Custom SVG Icons

## 🔗 Related Repositories
*   [Explicandum Core](https://github.com/zouzh14/explicandum-core): The FastAPI-based AI reasoning engine.
