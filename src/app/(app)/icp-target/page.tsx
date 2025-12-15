
import { Suspense } from "react"
import { getICPDefinition } from "@/app/actions/icp-actions"
import { ICPForm } from "./icp-form"
import { ICPAnalysisTabs } from "./icp-analysis-tabs"

export default async function ICPTargetPage() {
    const icpData = await getICPDefinition()

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col gap-2 border-b pb-6">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    Target ICP
                </h1>
                <p className="text-lg text-muted-foreground">
                    Define tu Cliente Ideal y deja que la IA encuentre las mejores oportunidades.
                </p>
            </div>

            <div className="space-y-8">
                <Suspense fallback={<div className="h-[200px] w-full animate-pulse rounded-xl bg-gray-100" />}>
                    {/* ICP Form (Capa 1) - Now Collapsible */}
                    <ICPForm initialData={icpData} />
                </Suspense>

                <div className="space-y-4">
                    {/* Tabs for Capa 2 & 3 */}
                    <Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-xl bg-gray-50" />}>
                        <ICPAnalysisTabs />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
