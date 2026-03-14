import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define the shape of our metadata based on the Pandas extraction
interface Metadata {
  columns: string[];
  categorical: Record<string, string[]>;
  numerical: Record<string, { min: number; max: number }>;
}

interface FileSession {
  file_id: string;
  filename: string;
  metadata: Metadata;
}

interface FileContextType {
  fileSession: FileSession | null;
  setFileSession: (session: FileSession | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [fileSession, setFileSessionState] = useState<FileSession | null>(null);

  // Initialize state from sessionStorage on first load/refresh 
  useEffect(() => {
    const storedSession = sessionStorage.getItem("fileSession");
    if (storedSession) {
      setFileSessionState(JSON.parse(storedSession));
    }
  }, []);

  // Wrap the state setter to also update sessionStorage automatically
  const setFileSession = (session: FileSession | null) => {
    setFileSessionState(session);
    if (session) {
      sessionStorage.setItem("fileSession", JSON.stringify(session));
    } else {
      sessionStorage.removeItem("fileSession");
    }
  };

  return (
    <FileContext.Provider value={{ fileSession, setFileSession }}>
      {children}
    </FileContext.Provider>
  );
};

// Custom hook to easily use the context in our components
export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
};