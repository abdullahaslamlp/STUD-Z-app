import { createContext, useContext, ReactNode } from "react";

// Gemini is the only provider now
export type AIProvider = "gemini";

interface AIProviderContextType {
  aiProvider: AIProvider;
}

const AIProviderContext = createContext<AIProviderContextType>({
  aiProvider: "gemini",
});

export function AIProviderProvider({ children }: { children: ReactNode }) {
  return (
    <AIProviderContext.Provider value={{ aiProvider: "gemini" }}>
      {children}
    </AIProviderContext.Provider>
  );
}

export const useAIProvider = () => useContext(AIProviderContext);
