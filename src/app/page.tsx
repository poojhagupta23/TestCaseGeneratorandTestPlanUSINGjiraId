"use client"

import { useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { generateDocx, generateCsv } from "@/lib/exportUtils"
import { Download, Play, RefreshCw } from "lucide-react"
import Papa from "papaparse"

export default function DashboardPage() {
  const [jiraId, setJiraId] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")

  const [jiraData, setJiraData] = useState<any>(null)
  const [testPlan, setTestPlan] = useState<string>("")
  const [testCases, setTestCases] = useState<any[]>([])

  const { groqKey, groqModel, jiraUrl, jiraEmail, jiraToken, addHistoryRecord } = useAppStore()

  const handleGenerate = async () => {
    if (!jiraId) {
      toast.error("Please enter a Jira ID")
      return
    }
    if (!groqKey || !jiraUrl || !jiraEmail || !jiraToken) {
      toast.error("Please configure API keys in Settings first")
      return
    }

    setLoading(true)
    setProgress(10)
    setStatusText("Fetching Jira ticket...")
    setJiraData(null)
    setTestPlan("")
    setTestCases([])

    try {
      const jiraRes = await fetch('/api/jira', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jiraId, jiraUrl, jiraEmail, jiraToken })
      })
      if (!jiraRes.ok) throw new Error(await jiraRes.text())
      const jData = await jiraRes.json()
      setJiraData(jData)
      setProgress(40)
      setStatusText("Generating Test Plan via AI...")

      // Simple extraction of Jira fields
      const summary = jData.fields?.summary || ''
      const description = typeof jData.fields?.description === 'string' 
        ? jData.fields.description 
        : JSON.stringify(jData.fields?.description || '')
        
      const requirementText = `Summary: ${summary}\nDescription: ${description}`
      
      const planRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groqKey,
          groqModel,
          systemPrompt: "You are a Senior QA Engineer. Generate a comprehensive Test Plan for the provided Jira requirement. Include sections: Objective, Scope, Features To Test, Test Strategy, Risk Analysis. Be concise but professional. Output ONLY Markdown.",
          prompt: requirementText
        })
      })
      if (!planRes.ok) throw new Error(await planRes.text())
      const pData = await planRes.json()
      setTestPlan(pData.content)
      setProgress(70)
      setStatusText("Generating Test Cases via AI...")

      const casesRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groqKey,
          groqModel,
          systemPrompt: `You are a Senior QA Engineer. Based on the following Test Plan and Requirement, generate test cases covering Functional, Negative, Boundary, UI.
OUTPUT FORMAT: Return ONLY a strict JSON array of objects. Do not include markdown formatting or backticks.
REQUIRED KEYS in each object exactly as spelled:
"Scenario", "TID", "Test Data", "TestCase Description", "PreCondition", "TestSteps", "Expected Result", "Actual Result", "Steps to Execute", "Expected Result_2", "Actual Result_2", "Status", "Executed QA Name"`,
          prompt: `Requirement:\n${requirementText}\n\nTest Plan:\n${pData.content}`
        })
      })
      if (!casesRes.ok) throw new Error(await casesRes.text())
      const cData = await casesRes.json()
      
      let parsedCases = []
      try {
        const rawContent = cData.content.replace(/```json/gi, '').replace(/```/g, '').trim()
        parsedCases = JSON.parse(rawContent)
      } catch (err) {
        console.error("Failed to parse JSON:", cData.content)
        throw new Error("AI returned malformed JSON for Test Cases. Please try again.")
      }
      
      setTestCases(parsedCases)
      setProgress(100)
      setStatusText("Completed!")
      toast.success("Generation completed successfully!")

      addHistoryRecord({
        id: crypto.randomUUID(),
        jiraId,
        testPlanMd: pData.content,
        testCasesCsv: Papa.unparse(parsedCases),
        createdAt: new Date().toISOString(),
        createdBy: 'System'
      })

    } catch (error: any) {
      toast.error(error.message || "An error occurred")
      setStatusText("Failed")
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const downloadTestPlan = () => {
    generateDocx(testPlan, `${jiraId}_TestPlan.docx`)
  }

  const downloadTestCases = () => {
    generateCsv(testCases, `${jiraId}_TestCases.csv`)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">QA Copilot Dashboard</h1>
        <p className="text-muted-foreground">Automate requirement analysis and test documentation creation.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit sticky top-20">
          <CardHeader>
            <CardTitle>Jira Input</CardTitle>
            <CardDescription>Enter Jira ID to start generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jiraId">Jira ID</Label>
              <Input 
                id="jiraId" 
                value={jiraId} 
                onChange={(e) => setJiraId(e.target.value)} 
                placeholder="e.g. SCRUM-7" 
              />
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={loading || !jiraId}>
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              {loading ? "Processing..." : "Analyze & Generate"}
            </Button>

            {loading && (
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{statusText}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            
            {jiraData && !loading && (
              <div className="pt-4 border-t mt-4 text-sm">
                <p className="font-semibold text-primary">Loaded: {jiraData.key}</p>
                <p className="text-muted-foreground truncate">{jiraData.fields?.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Test Plan</CardTitle>
                <CardDescription>AI Generated Test Plan Preview</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={downloadTestPlan} disabled={!testPlan}>
                <Download className="mr-2 h-4 w-4" /> DOCX
              </Button>
            </CardHeader>
            <CardContent>
              {testPlan ? (
                <div className="p-4 bg-muted/30 rounded-md max-h-96 overflow-y-auto whitespace-pre-wrap text-sm font-mono border">
                  {testPlan}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 border border-dashed rounded-md text-muted-foreground text-sm">
                  No Test Plan generated yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Test Cases</CardTitle>
                <CardDescription>AI Generated Test Cases Preview ({testCases.length} cases)</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={downloadTestCases} disabled={testCases.length === 0}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </CardHeader>
            <CardContent>
              {testCases.length > 0 ? (
                <div className="overflow-x-auto border rounded-md max-h-96">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/50 uppercase sticky top-0">
                      <tr>
                        <th className="px-4 py-3 border-b">TID</th>
                        <th className="px-4 py-3 border-b">Scenario</th>
                        <th className="px-4 py-3 border-b">Description</th>
                        <th className="px-4 py-3 border-b">Expected Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testCases.map((tc, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/30">
                          <td className="px-4 py-2 font-medium whitespace-nowrap">{tc.TID}</td>
                          <td className="px-4 py-2 min-w-[120px]">{tc.Scenario}</td>
                          <td className="px-4 py-2 min-w-[200px]">{tc["TestCase Description"]}</td>
                          <td className="px-4 py-2 min-w-[200px]">{tc["Expected Result"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 border border-dashed rounded-md text-muted-foreground text-sm">
                  No Test Cases generated yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
