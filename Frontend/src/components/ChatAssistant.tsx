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
  readonly patentTitle?: string;
}

export default function ChatAssistant({ patentTitle }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: patentTitle
        ? `Hello! I'm your patent assistant. I'm here to answer questions about "${patentTitle}". What would you like to know?`
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
        body: JSON.stringify({ question: input }),
      });
  
      const data = await response.json();
  
      if (data && data.answer) {
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
    } catch (error) {
      console.error("Error fetching answer:", error);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Something went wrong. Please try again later.",
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
          <Bot className="h-5 w-5 text-patent-blue" />
          Patent Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about patents, prior art, or get recommendations
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
                  <p className="mt-1 text-xs text-gray-500">
                    Sources: {message.sources.join(", ")}
                  </p>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble bot animate-pulse-slow">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs opacity-70">Assistant</span>
                </div>
                <p>Thinking...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        {!patentTitle && (
          <div className="bg-orange-50 p-3 rounded-md mb-3 w-full flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <p className="text-sm text-orange-800">
              For more specific assistance, please upload a patent document first.
            </p>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Ask a question about patents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
