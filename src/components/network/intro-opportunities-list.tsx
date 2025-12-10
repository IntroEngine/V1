"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, UserPlus, ArrowRight, Building2, MapPin } from "lucide-react"

import { IntroOpportunity } from "@/types/network"

type IntroOpportunitiesListProps = {
    opportunities: IntroOpportunity[]
    loading?: boolean
}

export function IntroOpportunitiesList({ opportunities, loading = false }: IntroOpportunitiesListProps) {
    if (loading) {
        return <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
        </div>
    }

    if (opportunities.length === 0) {
        return (
            <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Aún no hemos detectado oportunidades</h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-2">
                        Completa tu perfil e importa tus contactos para que nuestra IA pueda encontrar las mejores intros para ti.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {opportunities.map((opp) => (
                <Card key={opp.id} className="border-gray-200 hover:border-blue-200 hover:shadow-md transition-all group">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    {opp.target_company}
                                </h4>
                                {opp.target_role && (
                                    <p className="text-sm text-gray-600 mt-1">{opp.target_role}</p>
                                )}
                            </div>
                            <Badge
                                variant={opp.confidence_score > 80 ? "default" : "secondary"}
                                className={opp.confidence_score > 80 ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                            >
                                {opp.confidence_score}% Match
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="py-2 border-l-2 border-blue-100 pl-3 my-2 bg-blue-50/30 rounded-r-md">
                            <p className="text-sm text-gray-700 font-medium mb-1 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                Por qué: {opp.reasoning}
                            </p>
                            {opp.bridge_person && (
                                <p className="text-xs text-gray-600 mt-1">
                                    Vía: <span className="font-semibold">{opp.bridge_person}</span> ({opp.bridge_company})
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <Badge variant="outline" className="text-xs font-mono text-gray-500 uppercase">
                                {opp.type.replace('_', ' ')}
                            </Badge>
                            <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" variant="ghost">
                                Ver Detalles <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
