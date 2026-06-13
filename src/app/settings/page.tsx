"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function SettingsPage() {
  const { groqKey, jiraUrl, jiraEmail, jiraToken, setSettings } = useAppStore()
  
  const [localGroq, setLocalGroq] = useState("")
  const [localJiraUrl, setLocalJiraUrl] = useState("")
  const [localJiraEmail, setLocalJiraEmail] = useState("")
  const [localJiraToken, setLocalJiraToken] = useState("")

  // Hydrate local state after mount
  useEffect(() => {
    setLocalGroq(groqKey)
    setLocalJiraUrl(jiraUrl)
    setLocalJiraEmail(jiraEmail)
    setLocalJiraToken(jiraToken)
  }, [groqKey, jiraUrl, jiraEmail, jiraToken])

  const handleSave = () => {
    setSettings({
      groqKey: localGroq,
      jiraUrl: localJiraUrl,
      jiraEmail: localJiraEmail,
      jiraToken: localJiraToken,
    })
    toast.success("Settings saved successfully!")
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
          <CardDescription>Enter your Groq API key to enable AI generation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groq">Groq API Key</Label>
            <Input 
              id="groq" 
              type="password" 
              value={localGroq} 
              onChange={(e) => setLocalGroq(e.target.value)} 
              placeholder="gsk_..." 
            />
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
