'use client';

import { useQuery } from 'react-query';
import { useState } from 'react';

export default function AnalyticsPage() {
  // ✅ allow both string and null
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const { data: campaigns = [], isLoading } = useQuery('allCampaigns', async () => {
    const response = await fetch('/api/campaigns');
    return response.json();
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">AI Analytics</h1>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select a Campaign:</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={selectedCampaign ?? ''}  // ✅ safe fallback
          onChange={(e) => setSelectedCampaign(e.target.value)}
        >
          <option value="">-- Select --</option>
          {campaigns.map((c: any) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {selectedCampaign && (
        <CampaignAnalytics campaignId={selectedCampaign} />
      )}
    </div>
  );
}

function CampaignAnalytics({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useQuery(['campaignAnalytics', campaignId], async () => {
    const response = await fetch(`/api/campaigns/${campaignId}/analytics`);
    return response.json();
  });

  if (isLoading) return <div>Loading analytics...</div>;
  if (!data) return <div>No analytics available.</div>;

  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-lg font-bold mb-4">Insights</h2>
      <div className="text-gray-700 whitespace-pre-line">{data.insights}</div>
    </div>
  );
}
