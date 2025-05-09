
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const About = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-patent-blue mb-2">
          About Patent Insight Agent
        </h1>
        <p className="text-gray-600">
          Learn more about our AI-powered patent analysis system
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>What is Patent Insight Agent?</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 space-y-4">
              <p>Patent Insight Agent is an AI-powered system designed to automate the preliminary examination of patent proposals. It helps inventors, patent attorneys, and patent examiners quickly assess the novelty and patentability of new inventions by comparing them against existing patents.</p>
              <p className="mt-4">The system uses advanced natural language processing and machine learning techniques to analyze patent documents, identify similar existing patents, and provide actionable insights and recommendations.</p>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>The technologies behind Patent Insight Agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Document Processing</h3>
                <p className="text-gray-700">
                  We use LangChain's document loaders and text splitters to extract and process text from PDF patent proposals. This allows us to handle complex document structures common in patent applications.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Embedding Generation</h3>
                <p className="text-gray-700">
                  We leverage Google Gemini's embedding API to convert patent text into high-dimensional vector representations. These embeddings capture the semantic meaning of patent content, enabling accurate similarity comparisons.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Vector Database</h3>
                <p className="text-gray-700">
                  ChromaDB serves as our vector database for storing and retrieving patent embeddings. Its efficient similarity search capabilities allow us to quickly find potentially similar patents from a massive dataset.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Patent Database</h3>
                <p className="text-gray-700">
                  We utilize the Google Patents Public Data, which contains over 119 million patent publications from major patent offices worldwide, providing comprehensive coverage for similarity analysis.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Analysis Generation</h3>
                <p className="text-gray-700">
                  Using a Retrieval-Augmented Generation (RAG) approach, we combine retrieved similar patents with generative AI to produce legal summaries, identify potential issues, and generate recommendations tailored to each patent proposal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disclaimer</CardTitle>
            <CardDescription>Important information about using Patent Insight Agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 space-y-4">
              <p>
                Patent Insight Agent is designed for preliminary patent analysis and assistance only. It is not a substitute for professional legal advice or a comprehensive patentability search conducted by a qualified patent attorney or agent.
              </p>
              <p>
                While our system utilizes advanced AI techniques and a large database of existing patents, it may not identify all relevant prior art or potential issues with a patent application. The analysis and recommendations provided should be used as a starting point for further investigation.
              </p>
              <p>
                Users should always consult with a qualified patent attorney before making decisions about patent applications or responding to office actions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
