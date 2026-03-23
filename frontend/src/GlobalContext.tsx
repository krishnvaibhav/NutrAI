import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    isImage?: boolean;
}

export interface Recipe {
    name: string;
    reasoning: string;
    missing_ingredients: string[];
    instructions: string[];
    estimated_calories: number;
    estimated_protein: number;
    servings?: number;
    cost_per_dish?: number;
}

interface GlobalContextType {
    chatMessages: ChatMessage[];
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    healthSummary: string;
    setHealthSummary: (summary: string) => void;
    lastLogCount: number;
    setLastLogCount: (count: number) => void;
    recipes: Recipe[];
    setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
    recipePreferences: string;
    setRecipePreferences: (v: string) => void;
    recipeTimeOfDay: string;
    setRecipeTimeOfDay: (v: string) => void;
    expandedRecipeIdx: number | null;
    setExpandedRecipeIdx: React.Dispatch<React.SetStateAction<number | null>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Hi! I'm NutriAI. Tell me what you ate to log nutrition, ask for a recipe, or upload a photo of your fridge to update your pantry!" }
    ]);
    const [healthSummary, setHealthSummary] = useState<string>('');
    const [lastLogCount, setLastLogCount] = useState<number>(-1); // -1 means never fetched
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [recipePreferences, setRecipePreferences] = useState<string>('');
    const [recipeTimeOfDay, setRecipeTimeOfDay] = useState<string>('Dinner');
    const [expandedRecipeIdx, setExpandedRecipeIdx] = useState<number | null>(null);

    return (
        <GlobalContext.Provider value={{
            chatMessages,
            setChatMessages,
            healthSummary,
            setHealthSummary,
            lastLogCount,
            setLastLogCount,
            recipes,
            setRecipes,
            recipePreferences,
            setRecipePreferences,
            recipeTimeOfDay,
            setRecipeTimeOfDay,
            expandedRecipeIdx,
            setExpandedRecipeIdx,
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
