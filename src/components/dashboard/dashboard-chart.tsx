"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie } from "recharts"
import { DashboardStats } from "@/services/dashboardService"

interface DashboardChartProps {
    stats: DashboardStats
}

export function DashboardOverviewChart({ stats }: DashboardChartProps) {

    // Prepare data for Bar Chart (Funnel / Activty)
    const funnelData = [
        {
            name: "Sugerido",
            Intros: stats.introsSuggested,
            Outbound: stats.outboundSuggested,
        },
        {
            name: "Solicitado",
            Intros: stats.introsRequested,
            Outbound: 0, // We need to track this if we want it here, but current stats combine or omit. 
            // DashboardService.getStats returns 'introsRequested' and 'outboundSuggested'.
            // Wait, let's verify DashboardService again. 
            // It has 'introsRequested' but outbound is just 'suggested' and 'won' (in aggregate).
            // Let's use what we have.
        },
        {
            name: "Ganado",
            Total: stats.wonDeals
        }
    ]

    // Better data structure for distinct comparisons
    const comparisonData = [
        { name: 'Intros', value: stats.introsSuggested + stats.introsRequested, color: '#FF5A00' },
        { name: 'Outbound', value: stats.outboundSuggested, color: '#3B82F6' },
        { name: 'Ganados', value: stats.wonDeals, color: '#10B981' },
    ]

    return (
        <Card className="col-span-4 lg:col-span-2 border-gray-200 bg-white/40 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Resumen de Actividad</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData} layout="vertical" margin={{ left: 0, right: 30 }}>
                        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                            {comparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
