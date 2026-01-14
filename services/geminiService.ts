
import { VectorChunk } from "../types";

const API_BASE_URL = "http://localhost:8000";

export const extractPhilosophicalStance = async (message: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/extract-stance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    return data.stance;
  } catch (error) {
    console.error("Extraction Error:", error);
    return null;
  }
};

export const deletePhilosophicalStance = async (stanceId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stances/${stanceId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error("Deletion Error:", error);
    return false;
  }
};

export const deleteChatSession = async (sessionId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error("Session Deletion Error:", error);
    return false;
  }
};

export const streamExplicandumResponse = async (
  message: string,
  personalContext: string[],
  retrievedChunks: VectorChunk[],
  threadId: string,
  onChunk: (text: string) => void
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        personalContext,
        retrievedChunks,
        threadId,
        sessionHistory: [] // To be implemented if needed
      })
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      fullText += chunk;
      onChunk(fullText);
    }
  } catch (error) {
    console.error("Backend Connection Error:", error);
    onChunk("Error connecting to Explicandum core. Please verify your backend connection.");
  }
};
