
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import FileUpload from "@/components/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, AlertCircle, Clock } from "lucide-react";
import { Steps } from "@/components/Steps";

const Upload = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [processedFile, setProcessedFile] = useState<{
    name: string;
    size: number;
    document_id: string; // Changed from status to document_id
  } | null>(null);

  const handleFileProcessed = (fileData: {
    name: string;
    size: number;
    document_id: string; // Changed from status to document_id
  }) => {
    setProcessedFile(fileData); // Store full fileData including document_id
    setCurrentStep(2);
    
    // Simulate processing completion and redirect to analysis with document_id
    setTimeout(() => {
      setCurrentStep(3);
      setTimeout(() => {
        if (fileData.document_id) {
          navigate(`/analysis/${fileData.document_id}`);
        } else {
          // Handle error: document_id not available, maybe show a toast
          console.error("Document ID not available after processing for navigation.");
          // Optionally navigate to a generic error page or show an error toast
        }
      }, 1500);
    }, 3000);
  };

  const steps = [
    { id: 1, title: "Upload Document" },
    { id: 2, title: "Processing" },
    { id: 3, title: "Analysis Complete" },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-patent-blue mb-2">
            Patent Document Upload
          </h1>
          <p className="text-gray-600">
            Upload your patent proposal document for AI-powered analysis and insights.
          </p>
        </div>

        <Steps steps={steps} currentStep={currentStep} className="mb-8" />

        <div className="grid gap-6">
          <FileUpload onFileProcessed={handleFileProcessed} />

          {processedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Status</CardTitle>
                <CardDescription>
                  Your document is being analyzed by our AI system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-patent-blue" />
                      <div>
                        <p className="font-medium">{processedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(processedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="bg-patent-blue-100 text-patent-blue text-xs font-medium px-2 py-1 rounded">
                      {currentStep === 1 && "Pending"}
                      {currentStep === 2 && "Processing..."}
                      {currentStep === 3 && "Complete"}
                    </div>
                  </div>

                  {currentStep >= 2 && (
                    <div>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-patent-blue" />
                          <div>
                            <p className="font-medium">Text Extraction</p>
                            <p className="text-xs text-gray-500">
                              {currentStep >= 3 ? "Complete" : "In progress..."}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-patent-blue" />
                          <div>
                            <p className="font-medium">Embedding Generation</p>
                            <p className="text-xs text-gray-500">
                              {currentStep >= 3 ? "Complete" : "In progress..."}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-patent-blue" />
                          <div>
                            <p className="font-medium">Similar Patent Search</p>
                            <p className="text-xs text-gray-500">
                              {currentStep >= 3 ? "Complete" : "Waiting..."}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-patent-blue" />
                          <div>
                            <p className="font-medium">Analysis Generation</p>
                            <p className="text-xs text-gray-500">
                              {currentStep >= 3 ? "Complete" : "Waiting..."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        This process will take a few minutes. You'll be redirected to the analysis page when it's complete.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Patent Document Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Our system uses advanced AI to analyze your patent proposal and compare it against a database of 119 million existing patents from Google Patents Public Data.
                </p>
                <p>
                  The uploaded document will be processed using:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>LangChain document loaders for text extraction</li>
                  <li>Google Gemini for embedding generation</li>
                  <li>ChromaDB for efficient similarity search</li>
                  <li>Retrieval-Augmented Generation (RAG) for detailed analysis</li>
                </ul>
                <div className="bg-orange-50 p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <p className="text-sm text-orange-700">
                    This application is for preliminary review purposes only and should not replace professional legal advice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
