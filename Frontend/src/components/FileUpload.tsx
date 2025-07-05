import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileUp, CheckCircle, AlertCircle, X, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface FileUploadProps {
  // Updated to expect document_id from the backend response
  onFileProcessed: (fileData: { name: string; size: number; document_id: string }) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const { toast } = useToast();

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle drag leave event
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  // Handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Validate and set the selected file
  const validateAndSetFile = (file: File) => {
    // Check if the file is a PDF
    if (file.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload a PDF file.",
      });
      return;
    }
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 50MB.",
      });
      return;
    }
    
    setFile(file);
    setUploadStatus("idle");
    toast({
      title: "File selected",
      description: `Selected ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      // Assuming backend response now includes document_id:
      // e.g., { message: "...", document_id: "..." }
      const responseData = response.data;

      if (responseData && responseData.document_id) {
        setUploadStatus("success");
        onFileProcessed({
          name: file.name,
          size: file.size,
          document_id: responseData.document_id, // Pass document_id
        });
        toast({
          title: "Upload complete",
          description: `Your patent file has been successfully processed. Document ID: ${responseData.document_id}`,
        });
      } else {
        // Handle case where document_id is missing in response
        setUploadStatus("error");
        toast({
          variant: "destructive",
          title: "Upload succeeded but no Document ID received",
          description: "Could not get document identifier from the server.",
        });
      }
    } catch (error: unknown) {
      setUploadStatus("error");
      let errorMsg = "An error occurred during the upload. Please try again.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
        if (axiosError.response?.status === 413) {
          errorMsg = "File too large. Please upload a smaller file.";
        } else if (axiosError.response?.status === 415) {
          errorMsg = "Invalid file format. Please upload a PDF file.";
        } else if (axiosError.response?.data?.error) {
          errorMsg = axiosError.response.data.error;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMsg,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus("idle");
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {/* Drag and drop area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-patent-blue bg-patent-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Upload Patent Document</h3>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to upload a PDF file
              </p>
            </div>
            
            {/* File input with properly connected button */}
            <div className="relative">
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button
                asChild
                disabled={isUploading}
                className="mt-2"
                variant="outline"
              >
                <label htmlFor="file-upload" className="cursor-pointer flex items-center">
                  <FileUp className="mr-2 h-4 w-4" /> Select file
                </label>
              </Button>
            </div>
          </div>
        </div>

        {/* File preview and upload status */}
        {file && (
          <div className="mt-4 border border-gray-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 rounded">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {uploadStatus === "success" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {uploadStatus === "error" && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <button
                  onClick={removeFile}
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {uploadStatus === "uploading" && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-1" />
                <p className="text-xs text-gray-500 mt-1">
                  Processing: {uploadProgress}%
                </p>
              </div>
            )}

            {uploadStatus === "idle" && (
              <div className="mt-4 flex justify-end">
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? "Processing..." : "Process Document"}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}