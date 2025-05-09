
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SimilarPatent {
  id: string;
  title: string;
  similarity: number;
  date: string;
  assignee: string;
}

interface PatentSimilarityProps {
  similarPatents: SimilarPatent[];
}

export default function PatentSimilarity({ similarPatents }: PatentSimilarityProps) {
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 85) return "bg-red-500 text-white";
    if (similarity >= 70) return "bg-orange-400 text-white";
    if (similarity >= 50) return "bg-yellow-300 text-black";
    return "bg-green-500 text-white";
  };
  
  // Prepare data for pie chart
  const chartData = [
    { name: 'High (>85%)', value: similarPatents.filter(p => p.similarity >= 85).length, color: '#ef4444' },
    { name: 'Medium (70-85%)', value: similarPatents.filter(p => p.similarity >= 70 && p.similarity < 85).length, color: '#fb923c' },
    { name: 'Low (50-70%)', value: similarPatents.filter(p => p.similarity >= 50 && p.similarity < 70).length, color: '#facc15' },
    { name: 'Minimal (<50%)', value: similarPatents.filter(p => p.similarity < 50).length, color: '#22c55e' },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Similar Patents</CardTitle>
        <CardDescription>
          Detected {similarPatents.length} patents with potential similarity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => {
                    return percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null;
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} patents`, 'Count']}
                  labelFormatter={(name) => `Similarity: ${name}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-2/3">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {similarPatents.map((patent) => (
                  <div
                    key={patent.id}
                    className="border rounded-md p-4 hover:border-patent-blue transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{patent.title}</h4>
                      <Badge className={getSimilarityColor(patent.similarity)}>
                        {patent.similarity}% Similar
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 flex justify-between">
                      <span>Patent ID: {patent.id}</span>
                      <span>{patent.date} • {patent.assignee}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
