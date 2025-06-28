import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import Layout from "@/components/Layout";
import PatentSummary from "@/components/PatentSummary";
import PatentSimilarity from "@/components/PatentSimilarity";

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
  const { document_id } = useParams<{ document_id: string }>(); // Get document_id from URL

  useEffect(() => {
    if (!document_id) {
      setError("No document ID provided for analysis.");
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/analyze/${document_id}`);
        if (!response.ok) {
          let errorMsg = `Failed to fetch analysis data. Status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) { /* Ignore if error response is not JSON */ }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log("Fetched Analysis Data:", data);

        // The backend now returns the full structure: { patent: PatentData, similarPatents: SimilarPatent[] }
        // So, data itself should be what we set.
        // However, the backend route for /analyze/<doc_id> was structured to return:
        // jsonify(analysis_result_dict) where analysis_result_dict has title, date, summary, etc.
        // AND similarPatents. This matches the structure of `PatentData & { similarPatents: SimilarPatent[] }`
        // Let's assume the backend returns { title, ..., recommendations, similarPatents } directly.

        if (data && data.summary && data.similarPatents) { // Check for key fields
          // Separate patent data from similarPatents
          const { similarPatents: sp, ...patentDetails } = data;
          setPatentData(patentDetails as PatentData); // Cast if necessary, ensure PatentData matches backend
          setSimilarPatents(sp as SimilarPatent[]);
        } else {
          throw new Error("Analysis data is incomplete or malformed.");
        }
        
      } catch (err: any) {
        console.error("Error fetching analysis:", err);
        setError(err.message || "Could not load analysis results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [document_id]); // Re-run effect if document_id changes

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading patent analysis for document: {document_id}...</p>
      </Layout>
    );
  }

  if (error) { // Prioritize error display
    return (
      <Layout>
        <p className="text-red-500">Error: {error}</p>
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
        <h1 className="text-2xl font-bold text-patent-blue mb-2">
          Patent Analysis Results
        </h1>
        <p className="text-gray-600">
          AI-powered analysis and insights for your patent proposal
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <PatentSummary {...patentData} />
        <PatentSimilarity similarPatents={similarPatents} />
      </div>
    </Layout>
  );
}
