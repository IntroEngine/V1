"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MatchResults } from "./match-results"
import { ExpansionResults } from "./expansion-results"

export function ICPAnalysisTabs() {
    return (
        <Tabs defaultValue="capa2" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="capa2">Capa 2: Tu Red</TabsTrigger>
                <TabsTrigger value="capa3">Capa 3: Expansión IA</TabsTrigger>
            </TabsList>
            <TabsContent value="capa2" className="mt-6">
                <MatchResults />
            </TabsContent>
            <TabsContent value="capa3" className="mt-6">
                <ExpansionResults />
            </TabsContent>
        </Tabs>
    )
}
