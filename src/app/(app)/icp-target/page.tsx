
import { Suspense } from "react"
import { getICPDefinition } from "@/app/actions/icp-actions"
import { ICPForm } from "./icp-form"
import { MatchResults } from "./match-results"
import { ExpansionResults } from "./expansion-results"

export default async function ICPTargetPage() {
    const icpData = await getICPDefinition()

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Objetivo ICP</h1>
                <p className="text-gray-500">
                    Capa 1: Define el cerebro (ICP). Capa 2: Encuentra matches en tu red.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
                <div className="space-y-6">
                    <Suspense fallback={<div>Cargando configuración...</div>}>
                        <ICPForm initialData={icpData} />
                    </Suspense>
                </div>

                <div className="space-y-6">
                    <Suspense fallback={<div>Analizando red...</div>}>
                        <MatchResults />
                    </Suspense>
                    <Suspense fallback={<div>Cargando IA...</div>}>
                        <ExpansionResults />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
