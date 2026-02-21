import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    isImage?: boolean;
}

interface GlobalContextType {
    chatMessages: ChatMessage[];
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    healthSummary: string;
    setHealthSummary: (summary: string) => void;
    lastLogCount: number;
    setLastLogCount: (count: number) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Hi! I'm NutriAI. Tell me what you ate to log nutrition, ask for a recipe, or upload a photo of your fridge to update your pantry!" }
    ]);
    const [healthSummary, setHealthSummary] = useState<string>('');
    const [lastLogCount, setLastLogCount] = useState<number>(-1); // -1 means never fetched

    return (
        <GlobalContext.Provider value={{
            chatMessages,
            setChatMessages,
            healthSummary,
            setHealthSummary,
            lastLogCount,
            setLastLogCount
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
};
