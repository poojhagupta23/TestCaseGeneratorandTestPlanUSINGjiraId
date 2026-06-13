"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const { groqKey, groqModel, jiraUrl, jiraEmail, jiraToken, setSettings } = useAppStore()
  
  const [localGroq, setLocalGroq] = useState("")
  const [localGroqModel, setLocalGroqModel] = useState("llama-3.3-70b-versatile")
  const [localJiraUrl, setLocalJiraUrl] = useState("")
  const [localJiraEmail, setLocalJiraEmail] = useState("")
  const [localJiraToken, setLocalJiraToken] = useState("")
  
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [loadingModels, setLoadingModels] = useState(false)

  // Hydrate local state after mount
  useEffect(() => {
    setLocalGroq(groqKey)
    if (groqModel) setLocalGroqModel(groqModel)
    setLocalJiraUrl(jiraUrl)
    setLocalJiraEmail(jiraEmail)
    setLocalJiraToken(jiraToken)
  }, [groqKey, groqModel, jiraUrl, jiraEmail, jiraToken])

  const handleSave = () => {
    setSettings({
      groqKey: localGroq,
      groqModel: localGroqModel,
      jiraUrl: localJiraUrl,
      jiraEmail: localJiraEmail,
      jiraToken: localJiraToken,
    })
    toast.success("Settings saved successfully!")
  }

  const fetchModels = async () => {
    if (!localGroq) {
      toast.error("Please enter a Groq API Key first.")
      return
    }
    setLoadingModels(true)
    try {
      const res = await fetch('/api/groq/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqKey: localGroq })
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      
      const modelsList = data.models || []
      // Sort models to bring popular ones to top or just alphabetically
      modelsList.sort((a: any, b: any) => a.id.localeCompare(b.id))
      setAvailableModels(modelsList)
      
      toast.success("Models fetched successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch models")
    } finally {
      setLoadingModels(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your API keys and Jira connection.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Groq AI Configuration</CardTitle>
          <CardDescription>Enter your Groq API key and select your preferred LLM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groq">Groq API Key</Label>
            <div className="flex gap-2">
              <Input 
                id="groq" 
                type="password" 
                value={localGroq} 
                onChange={(e) => setLocalGroq(e.target.value)} 
                placeholder="gsk_..." 
              />
              <Button variant="outline" onClick={fetchModels} disabled={loadingModels || !localGroq}>
                {loadingModels ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Fetch Models
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="groqModel">Preferred Model</Label>
            <Select value={localGroqModel} onValueChange={(val) => { if (val) setLocalGroqModel(val) }}>
              <SelectTrigger id="groqModel">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.length > 0 ? (
                  availableModels.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.id}</SelectItem>
                  ))
                ) : (
                  <SelectItem value={localGroqModel}>{localGroqModel}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Click 'Fetch Models' to see all available options from Groq.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jira Configuration</CardTitle>
          <CardDescription>Enter your Jira credentials to fetch PRDs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jiraUrl">Jira Base URL</Label>
            <Input 
              id="jiraUrl" 
              value={localJiraUrl} 
              onChange={(e) => setLocalJiraUrl(e.target.value)} 
              placeholder="https://your-domain.atlassian.net" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jiraEmail">Jira Email Address</Label>
            <Input 
              id="jiraEmail" 
              type="email" 
              value={localJiraEmail} 
              onChange={(e) => setLocalJiraEmail(e.target.value)} 
              placeholder="you@example.com" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jiraToken">Jira API Token</Label>
            <Input 
              id="jiraToken" 
              type="password" 
              value={localJiraToken} 
              onChange={(e) => setLocalJiraToken(e.target.value)} 
              placeholder="ATATT..." 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Configuration</Button>
      </div>
    </div>
  )
}
