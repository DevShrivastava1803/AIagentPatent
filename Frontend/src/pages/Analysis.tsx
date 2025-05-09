import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch("/analyze"); // Make sure this path matches your Flask route
        if (!response.ok) {
          throw new Error("Failed to fetch analysis data");
        }

        // Log response headers for debugging
        console.log("Response Headers:", response.headers);

        const data = await response.json();  // Expecting JSON from Flask API
        console.log("Fetched Data:", data);  // Log the response data

        // If the data is valid, update state
        setPatentData(data.patent);
        setSimilarPatents(data.similarPatents);
        
      } catch (err) {
        console.error("Error fetching analysis:", err);
        setError("Could not load analysis results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-500">Loading patent analysis...</p>
      </Layout>
    );
  }

  if (error || !patentData) {
    return (
      <Layout>
        <p className="text-red-500">{error || "Unknown error occurred."}</p>
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
