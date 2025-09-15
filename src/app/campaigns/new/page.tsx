'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Rule {
  field: string;
  operator: string;
  value: string | number;
  conjunction: 'AND' | 'OR';
}

export default function CampaignCreator() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rules, setRules] = useState<Rule[]>([
    { field: 'totalSpent', operator: '>', value: '', conjunction: 'AND' }
  ]);
  const [audiencePreview, setAudiencePreview] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addRule = () => {
    setRules([...rules, { field: 'totalSpent', operator: '>', value: '', conjunction: 'AND' }]);
  };

  const updateRule = (index: number, field: keyof Rule, value: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const previewAudience = async () => {
    try {
      const response = await fetch('/api/segments/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });
      const data = await response.json();
      setAudiencePreview(data.count);
    } catch (error) {
      console.error('Error previewing audience:', error);
    }
  };

  const saveCampaign = async () => {
    setError('');
    setSuccess('');
    try {
      // First save the segment
      const segmentResponse = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${name} Segment`,
          rules,
          createdBy: session?.user?.email
        })
      });
      const segmentData = await segmentResponse.json();
      if (!segmentResponse.ok) {
        setError(segmentData.error || 'Failed to create segment');
        return;
      }

      // Then create the campaign
      const campaignResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          segmentId: segmentData._id,
          message,
          createdBy: session?.user?.email
        })
      });
      const campaignData = await campaignResponse.json();
      if (!campaignResponse.ok) {
        setError(campaignData.error || 'Failed to create campaign');
        return;
      }

      setSuccess('Campaign created successfully!');
      setName('');
      setMessage('');
      setRules([{ field: 'totalSpent', operator: '>', value: '', conjunction: 'AND' }]);
      setTimeout(() => router.push('/campaigns'), 1000);
    } catch (error) {
      setError('Error saving campaign');
      console.error('Error saving campaign:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Audience Rules</label>
          <div className="space-y-4 mt-2">
            {rules.map((rule, index) => (
              <div key={index} className="flex gap-4">
                <select
                  value={rule.field}
                  onChange={(e) => updateRule(index, 'field', e.target.value)}
                  className="rounded-md border-gray-300"
                >
                  <option value="totalSpent">Total Spent</option>
                  <option value="totalOrders">Total Orders</option>
                  <option value="lastPurchaseDate">Last Purchase Date</option>
                  <option value="customerSegment">Customer Segment</option>
                </select>
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(index, 'operator', e.target.value)}
                  className="rounded-md border-gray-300"
                >
                  <option value=">">Greater than</option>
                  <option value="<">Less than</option>
                  <option value=">=">Greater than or equal</option>
                  <option value="<=">Less than or equal</option>
                  <option value="==">Equal to</option>
                  <option value="!=">Not equal to</option>
                </select>
                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => updateRule(index, 'value', e.target.value)}
                  className="rounded-md border-gray-300"
                  placeholder="Value"
                />
                {index < rules.length - 1 && (
                  <select
                    value={rule.conjunction}
                    onChange={(e) => updateRule(index, 'conjunction', e.target.value as 'AND' | 'OR')}
                    className="rounded-md border-gray-300"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addRule}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          >
            + Add another rule
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message Template</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Hi {firstName}, here's a special offer for you!"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={previewAudience}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Preview Audience
          </button>
          {audiencePreview !== null && (
            <span className="py-2 text-sm text-gray-600">
              Estimated audience size: {audiencePreview} customers
            </span>
          )}
        </div>

        <div>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
          <button
            onClick={saveCampaign}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
