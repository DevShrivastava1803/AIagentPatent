
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Check, Info } from "lucide-react";

interface PatentSummaryProps {
  title: string;
  date: string;
  applicant: string;
  summary: string;
  noveltyScore: number;
  potentialIssues: string[];
  recommendations: string[];
}

export default function PatentSummary({
  title,
  date,
  applicant,
  summary,
  noveltyScore,
  potentialIssues,
  recommendations,
}: PatentSummaryProps) {
  const getNoveltyColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {date} • Filed by {applicant}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Novelty Score:</span>
            <div className="flex items-center">
              <div
                className={`h-3 w-16 rounded-full ${getNoveltyColor(noveltyScore)}`}
              ></div>
              <span className="ml-2 font-bold">{noveltyScore}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="issues">Potential Issues</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <div className="text-sm text-gray-700 whitespace-pre-line space-y-2">
              {summary.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="issues">
            <div className="space-y-3">
              {potentialIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <p className="text-sm text-gray-700">{issue}</p>
                </div>
              ))}
              {potentialIssues.length === 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <p className="text-sm text-gray-700">No significant issues detected.</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="recommendations">
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
