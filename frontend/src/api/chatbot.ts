import { apiRequest } from "./http";

export interface ChatMessage {
  id?: string;
  role: "user" | "model";
  content: string;
  createdAt?: string;
}

export async function getChatHistory(token: string): Promise<ChatMessage[]> {
  return apiRequest<ChatMessage[]>("/chatbot/history", {
    token,
  });
}

export async function sendMessage(token: string, message: string): Promise<{ reply: string, messageId: string }> {
  return apiRequest<{ reply: string, messageId: string }>("/chatbot/chat", {
    method: "POST",
    token,
    body: { message },
  });
}
