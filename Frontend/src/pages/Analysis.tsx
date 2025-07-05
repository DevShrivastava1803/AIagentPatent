import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PatentSummary from "@/components/PatentSummary";
import PatentSimilarity from "@/components/PatentSimilarity";
import { Button } from "@/components/ui/button";
import { MessageCircle, AlertCircle } from "lucide-react";
import { getLastAnalysis, saveLastAnalysis, AnalysisData } from "@/utils/analysisStorage";

interface SimilarPatent {
  id: string;
  title: string;
  similarity: number;
  date: string;
  assignee: string;
}

interface PatentData {
  title: string;
  date: string;
  applicant: string;
  summary: string;
  noveltyScore: number;
  potentialIssues: string[];
  recommendations: string[];
}

export default function Analysis() {
  const [patentData, setPatentData] = useState<PatentData | null>(null);
  const [similarPatents, setSimilarPatents] = useState<SimilarPatent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { document_id } = useParams<{ document_id?: string }>(); // Get document_id from URL (optional)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // If no document_id provided, try to load last analysis
        if (!document_id) {
          const lastAnalysis = getLastAnalysis();
          if (lastAnalysis) {
            setPatentData({
              title: lastAnalysis.title,
              date: lastAnalysis.date,
              applicant: lastAnalysis.applicant,
              summary: lastAnalysis.summary,
              noveltyScore: lastAnalysis.noveltyScore,
              potentialIssues: lastAnalysis.potentialIssues,
              recommendations: lastAnalysis.recommendations,
            });
            setSimilarPatents(lastAnalysis.similarPatents);
            setLoading(false);
            return;
          } else {
            setError("No document ID provided and no recent analysis found. Please upload a document first.");
            setLoading(false);
            return;
          }
        }

        // Fetch analysis for specific document_id
        const response = await fetch(`http://localhost:5000/analyze/${document_id}`);
        if (!response.ok) {
          let errorMsg = `Failed to fetch analysis data. Status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) { /* Ignore if error response is not JSON */ }
          throw new Error(errorMsg);
        }

        const data = await response.json();

        // The backend returns a single object with all patent data including similarPatents
        if (data && data.summary && data.similarPatents) {
          // Separate patent data from similarPatents
          const { similarPatents: sp, ...patentDetails } = data;
          setPatentData(patentDetails as PatentData);
          setSimilarPatents(sp as SimilarPatent[]);
          
          // Save this analysis as the last one
          saveLastAnalysis({
            document_id: document_id,
            ...patentDetails,
            similarPatents: sp,
            timestamp: Date.now(),
          } as AnalysisData);
        } else {
          throw new Error("Analysis data is incomplete or malformed.");
        }
        
      } catch (err: unknown) {
        console.error("Error fetching analysis:", err);
        const errorMessage = err instanceof Error ? err.message : "Could not load analysis results. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [document_id]); // Re-run effect if document_id changes

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {document_id 
              ? `Loading patent analysis for: ${decodeURIComponent(document_id)}`
              : "Loading last analysis..."
            }
          </p>
        </div>
      </Layout>
    );
  }

  if (error) { // Prioritize error display
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analysis Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => navigate('/upload')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Upload a Document
          </Button>
        </div>
      </Layout>
    );
  }

  if (!patentData) { // If not loading and no error, but no data (e.g. bad document_id from backend 404)
     return (
      <Layout>
        <p className="text-orange-500">No analysis data found for document: {document_id}. It might still be processing or the ID is invalid.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">
          Patent Analysis Results
        </h1>
        <p className="text-gray-600">
          {document_id 
            ? `AI-powered analysis and insights for: ${decodeURIComponent(document_id)}`
            : "Last analysis results (from previous session)"
          }
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <PatentSummary {...patentData} />
        <PatentSimilarity similarPatents={similarPatents} />
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={() => navigate(`/chat/${document_id || patentData?.title}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Chat about this Document
        </Button>
        
        {!document_id && (
          <Button 
            onClick={() => navigate('/upload')}
            variant="outline"
            className="px-6 py-3"
          >
            Upload New Document
          </Button>
        )}
      </div>
    </Layout>
  );
}
