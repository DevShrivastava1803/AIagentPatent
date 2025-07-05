
import Layout from "@/components/Layout";
import DashboardCard from "@/components/DashboardCard";
import { Button } from "@/components/ui/button";
import { 
  FileUp, 
  FileText, 
  BarChart3,
  Clock, 
  Search,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const recentPatents = [
    { id: "US20230123456", title: "Quantum Computing Implementation for Neural Networks", date: "2023-05-12" },
    { id: "US20230098765", title: "Blockchain-based Patent Verification System", date: "2023-04-28" },
    { id: "US20230087654", title: "AI-Driven Process Optimization System", date: "2023-03-15" }
  ];

  return (
    <Layout>
      <div className="grid gap-6">
                  <section className="bg-blue-50 rounded-xl p-6 md:p-10 backdrop-blur-sm">
          <div className="max-w-4xl">
                          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">
              Patent Insight Agent
            </h1>
                          <p className="text-lg mb-6 text-blue-800">
              AI-powered patent analysis to streamline your patent review process and identify potential conflicts with existing patents.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/upload">
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload Patent
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/chat">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask Assistant
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard 
            title="Upload Patent" 
            description="Extract and analyze your patent documents" 
                          icon={<FileUp className="h-5 w-5 text-blue-600" />}
          >
            <p className="text-sm mb-4">
              Upload your patent proposal document to extract text, analyze content, and identify potential conflicts.
            </p>
            <Button asChild className="w-full">
              <Link to="/upload">Get Started</Link>
            </Button>
          </DashboardCard>
          
          <DashboardCard 
            title="Patent Analysis" 
            description="View detailed analysis of your patents" 
                          icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
          >
            <p className="text-sm mb-4">
              Get insights on novelty scores, similar patents, and potential issues to address in your patent application.
            </p>
            <Button asChild className="w-full">
              <Link to="/analysis">View Analysis</Link>
            </Button>
          </DashboardCard>
          
          <DashboardCard 
            title="Chat Assistant" 
            description="Ask questions about your patents" 
                          icon={<MessageSquare className="h-5 w-5 text-blue-600" />}
          >
            <p className="text-sm mb-4">
              Use our AI assistant to ask specific questions about your patent, prior art, and get personalized recommendations.
            </p>
            <Button asChild className="w-full">
              <Link to="/chat">Ask Assistant</Link>
            </Button>
          </DashboardCard>
        </div>

        <DashboardCard 
          title="Recent Patents" 
          description="Recently analyzed patent documents" 
                        icon={<Clock className="h-5 w-5 text-blue-600" />}
          className="col-span-full"
        >
          <div className="space-y-4">
            {recentPatents.map((patent) => (
              <div key={patent.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
                <div className="flex items-center gap-3">
                                      <div className="bg-blue-50 p-2 rounded">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{patent.title}</h4>
                    <p className="text-xs text-gray-500">{patent.id} • {patent.date}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/analysis?id=${patent.id}`}>
                    <Search className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </Layout>
  );
};

export default Index;
