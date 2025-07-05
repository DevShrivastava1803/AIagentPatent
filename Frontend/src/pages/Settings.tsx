
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [apiKeys, setApiKeys] = useState({
    gemini: "",
    openai: "",
  });
  const [settings, setSettings] = useState({
    enableNotifications: true,
    storeAnalysisHistory: true,
    detailedAnalysis: false,
  });
  const { toast } = useToast();

  const handleSaveApiKeys = () => {
    toast({
      title: "API keys saved",
      description: "Your API keys have been securely saved.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
                    <h1 className="text-2xl font-bold text-blue-600 mb-2">Settings</h1>
        <p className="text-gray-600">
          Configure your preferences and API connections
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Connect to external AI services for enhanced capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gemini-api">Google Gemini API Key</Label>
                <Input
                  id="gemini-api"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKeys.gemini}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, gemini: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Used for embedding generation and enhanced analysis capabilities
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-api">OpenAI API Key (Optional)</Label>
                <Input
                  id="openai-api"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={apiKeys.openai}
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, openai: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500">
                  Optional: Enables advanced RAG capabilities and improved similarity detection
                </p>
              </div>

              <Button onClick={handleSaveApiKeys}>Save API Keys</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Configure your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive alerts when analysis is complete
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="store-history" className="text-base">
                    Store Analysis History
                  </Label>
                  <p className="text-sm text-gray-500">
                    Save previous patent analyses for future reference
                  </p>
                </div>
                <Switch
                  id="store-history"
                  checked={settings.storeAnalysisHistory}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, storeAnalysisHistory: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="detailed-analysis" className="text-base">
                    Detailed Analysis Mode
                  </Label>
                  <p className="text-sm text-gray-500">
                    Perform more comprehensive but slower analysis
                  </p>
                </div>
                <Switch
                  id="detailed-analysis"
                  checked={settings.detailedAnalysis}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, detailedAnalysis: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your data and analysis history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                You can clear your analysis history and cached data at any time.
                This will remove all stored patent analyses and reset the application.
              </p>
              <div className="flex gap-4">
                <Button variant="outline">Clear Analysis History</Button>
                <Button variant="destructive">Reset All Data</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
