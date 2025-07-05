import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Bot, Send, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  sources?: string[];
}

interface ChatAssistantProps {
  readonly documentId?: string;
}

export default function ChatAssistant({ documentId }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: documentId
        ? `Hello! I'm your patent assistant. I'm here to answer questions about your uploaded document: "${decodeURIComponent(documentId)}". What would you like to know about it?`
        : "Hello! I'm your patent assistant. Please upload a patent document first, or ask me general questions about patents and intellectual property.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
  
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
  
    try {
      // Fetch answer from backend
      const response = await fetch("http://localhost:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          question: input,
          document_id: documentId // Include document context if available
        }),
      });
  
      const data = await response.json();
  
      if (data?.answer) {
        // Add assistant message with answer
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.answer,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
  
        // Display sources as well if available
        if (data.sources) {
          const sourceMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: `Sources: ${data.sources.join(", ")}`,
            role: "assistant",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, sourceMessage]);
        }
      } else {
        // Handle no answer case
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "No answer received.",
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error: unknown) {
      console.error("Error fetching answer:", error);
      let errorMessage = "Something went wrong. Please try again later.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const fetchError = error as { response?: { status?: number } };
        if (fetchError.response?.status === 404) {
          errorMessage = "No relevant information found. Please try a different question.";
        } else if (fetchError.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="flex flex-col h-[calc(100vh-180px)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Patent Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about patents, prior art, or get recommendations. I can help with patent analysis, prior art searches, and technical explanations.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full px-6" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-bubble ${message.role === "user" ? "user" : "bot"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  <span className="text-xs opacity-70">
                    {message.role === "user" ? "You" : "Assistant"} •{" "}
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p>{message.content}</p>
                {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-700 font-medium mb-1">📚 Sources:</p>
                    <div className="text-xs text-blue-600">
                      {message.sources.map((source, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <span>•</span>
                          <span>{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble bot">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs opacity-70">Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Thinking</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        {!documentId && (
          <div className="bg-orange-50 p-3 rounded-md mb-3 w-full flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <p className="text-sm text-orange-800">
              For more specific assistance, please upload a patent document first.
            </p>
          </div>
        )}
        
        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {documentId ? [
                "What is this document about?",
                "What are the main claims in this document?",
                "What technologies are mentioned?",
                "What are the key innovations described?",
                "Summarize the technical approach"
              ] : [
                "What is RPA technology?",
                "How does machine learning improve patent analysis?",
                "What are the key components of a patent?",
                "Explain the patent filing process"
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Ask a question about patents... (Press Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSendMessage(e as any);
                }
              }
            }}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
            <span className="ml-2">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
