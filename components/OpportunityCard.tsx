import { Opportunity, Target, Contact } from '@/db/schema';
import { Mail, Network, ArrowRight } from 'lucide-react';

export function OpportunityCard({ opportunity, target, contact }: { opportunity: Opportunity, target?: Target, contact?: Contact }) {
    const isDirect = opportunity.type === 'DIRECT';
    const isOutbound = opportunity.type === 'OUTBOUND';

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg">{target?.name || 'Unknown Company'}</h3>
                    <p className="text-sm text-gray-500">{target?.industry}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${isDirect ? 'bg-green-100 text-green-700' :
                    isOutbound ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {opportunity.type.replace('_', ' ')}
                </div>
            </div>

            <div className="my-3">
                {contact ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Network className="w-4 h-4" />
                        <span>Via: <strong>{contact.name}</strong> ({contact.current_title})</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        <span>Cold Outbound Strategy</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 p-2 rounded text-xs">
                <div>
                    <span className="block text-gray-400">Total Score</span>
                    <span className="font-bold text-lg text-indigo-600">{opportunity.score_total}/100</span>
                </div>
                <div>
                    <span className="block text-gray-400">Intro Strength</span>
                    <span className="font-medium">{opportunity.score_intro_strength}</span>
                </div>
            </div>

            <button className="w-full flex justify-center items-center gap-2 bg-black text-white py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
                {isOutbound ? 'Generate Outreach' : 'Request Intro'}
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
