
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ChatAssistant from "@/components/ChatAssistant";

const Chat = () => {
  const { document_id } = useParams<{ document_id?: string }>();

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-2">
          Patent Assistant
        </h1>
        <p className="text-gray-600">
          {document_id 
            ? `Ask questions about your uploaded document: ${decodeURIComponent(document_id)}`
            : "Ask questions about patents, prior art, and get AI-powered recommendations"
          }
        </p>
      </div>

      <ChatAssistant documentId={document_id} />
    </Layout>
  );
};

export default Chat;
