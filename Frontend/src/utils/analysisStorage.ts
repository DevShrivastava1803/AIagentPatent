// Utility for storing and retrieving the last analysis data

export interface AnalysisData {
  document_id: string;
  title: string;
  date: string;
  applicant: string;
  summary: string;
  noveltyScore: number;
  potentialIssues: string[];
  recommendations: string[];
  similarPatents: Array<{
    id: string;
    title: string;
    similarity: number;
    date: string;
    assignee: string;
  }>;
  timestamp: number;
}

const STORAGE_KEY = 'last_analysis_data';

export const saveLastAnalysis = (data: AnalysisData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save analysis data:', error);
  }
};

export const getLastAnalysis = (): AnalysisData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Check if data is not too old (24 hours)
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (now - data.timestamp > oneDay) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to retrieve analysis data:', error);
    return null;
  }
};

export const clearLastAnalysis = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear analysis data:', error);
  }
}; 