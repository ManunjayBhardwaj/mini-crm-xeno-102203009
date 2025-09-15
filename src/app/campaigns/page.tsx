'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useQuery } from 'react-query';

interface Campaign {
  _id: string;
  name: string;
  status: string;
  stats: {
    audienceSize: number;
    sent: number;
    failed: number;
    delivered: number;
  };
  createdAt: string;
}

export default function CampaignsPage() {
  const { data: session } = useSession();

  const {
    data: campaigns = [],
    isLoading,
    refetch,
  } = useQuery<Campaign[]>('allCampaigns', async () => {
    const response = await fetch('/api/campaigns');
    return response.json();
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <div className="flex gap-2">
          <Link
            href="/campaigns/new"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Create New Campaign
          </Link>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : campaigns?.length ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audience Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/campaigns/${campaign._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {campaign.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          campaign.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : campaign.status === 'running'
                            ? 'bg-blue-100 text-blue-800'
                            : campaign.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.stats.audienceSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.stats.delivered} delivered / {campaign.stats.failed} failed
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">No campaigns found</div>
        )}
      </div>
    </div>
  );
}
