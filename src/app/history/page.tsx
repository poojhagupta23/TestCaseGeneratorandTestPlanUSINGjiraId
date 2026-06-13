"use client"

import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2 } from "lucide-react"
import { generateDocx } from "@/lib/exportUtils"
import { toast } from "sonner"

export default function HistoryPage() {
  const { history, removeHistoryRecord } = useAppStore()

  const handleDownloadDocx = (md: string, id: string) => {
    generateDocx(md, `${id}_TestPlan.docx`)
  }

  const handleDownloadCsv = (csvText: string, id: string) => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${id}_TestCases.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Generation History</h1>
        <p className="text-muted-foreground">View and download your previously generated test plans and cases.</p>
      </div>

      <div className="grid gap-4">
        {history.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p>No history found.</p>
              <p className="text-sm">Generate some test plans to see them here.</p>
            </CardContent>
          </Card>
        ) : (
          history.map((record) => (
            <Card key={record.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{record.jiraId}</CardTitle>
                  <CardDescription>Generated on {new Date(record.createdAt).toLocaleString()}</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive/90"
                  onClick={() => {
                    removeHistoryRecord(record.id)
                    toast.success("Record deleted")
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => handleDownloadDocx(record.testPlanMd, record.jiraId)}>
                    <Download className="mr-2 h-4 w-4" /> Download Test Plan (.docx)
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadCsv(record.testCasesCsv, record.jiraId)}>
                    <Download className="mr-2 h-4 w-4" /> Download Test Cases (.csv)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
