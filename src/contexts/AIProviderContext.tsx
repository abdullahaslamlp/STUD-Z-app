import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AIProvider = "lovable" | "gemini";

interface AIProviderContextType {
  aiProvider: AIProvider;
  setAIProvider: (p: AIProvider) => void;
}

const AIProviderContext = createContext<AIProviderContextType>({
  aiProvider: "lovable",
  setAIProvider: () => {},
});

export function AIProviderProvider({ children }: { children: ReactNode }) {
  const [aiProvider, setAIProviderState] = useState<AIProvider>("gemini");

  const setAIProvider = (p: AIProvider) => {
    setAIProviderState(p);
    localStorage.setItem("stud-z-ai-provider", p);
  };

  return (
    <AIProviderContext.Provider value={{ aiProvider, setAIProvider }}>
      {children}
    </AIProviderContext.Provider>
  );
}

export const useAIProvider = () => useContext(AIProviderContext);
