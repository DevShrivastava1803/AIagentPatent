
import Layout from "@/components/Layout";
import ChatAssistant from "@/components/ChatAssistant";

const Chat = () => {
  // Mock data for currently loaded patent (if any)
  const currentPatent = {
    title: "Quantum Computing Implementation for Neural Networks",
    id: "US20230123456"
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-patent-blue mb-2">
          Patent Assistant
        </h1>
        <p className="text-gray-600">
          Ask questions about patents, prior art, and get AI-powered recommendations
        </p>
      </div>

      <ChatAssistant patentTitle={currentPatent.title} />
    </Layout>
  );
};

export default Chat;
