
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartBarIcon, UsersIcon, EnvelopeIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';

// Mock data - replace with real data from your API
const dummyData = [
  { month: 'Jan', campaigns: 4, delivered: 2400 },
  { month: 'Feb', campaigns: 3, delivered: 1398 },
  { month: 'Mar', campaigns: 5, delivered: 9800 },
  { month: 'Apr', campaigns: 2, delivered: 3908 },
  { month: 'May', campaigns: 6, delivered: 4800 },
  { month: 'Jun', campaigns: 4, delivered: 3800 },
];

export default function Dashboard() {
  const { data: customers, isLoading: customersLoading } = useQuery('allCustomers', async () => {
    const res = await fetch('/api/customers');
    return res.json();
  });
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });
  const [customerError, setCustomerError] = useState('');
  const [customerSuccess, setCustomerSuccess] = useState('');

  const handleCustomerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError('');
    setCustomerSuccess('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add customer');
      setCustomerSuccess('Customer added successfully!');
      setCustomerForm({ firstName: '', lastName: '', email: '', phoneNumber: '' });
    } catch (err: any) {
      setCustomerError(err.message);
    }
  };
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: stats, isLoading: statsLoading } = useQuery('dashboardStats', async () => {
    const res = await fetch('/api/dashboard/stats');
    return res.json();
  });

  const { data: recentCampaigns, isLoading: campaignsLoading } = useQuery(
    'recentCampaigns',
    async () => {
      const res = await fetch('/api/campaigns?limit=5');
      return res.json();
    }
  );

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-md ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Add Customer Button */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          onClick={() => setShowCustomerModal(true)}
        >
          Add Customer
        </button>
      </div>

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={customerForm.firstName}
                onChange={handleCustomerInput}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={customerForm.lastName}
                onChange={handleCustomerInput}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={customerForm.email}
                onChange={handleCustomerInput}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={customerForm.phoneNumber}
                onChange={handleCustomerInput}
                className="w-full border px-3 py-2 rounded"
              />
              {customerError && <div className="text-red-600 text-sm">{customerError}</div>}
              {customerSuccess && <div className="text-green-600 text-sm">{customerSuccess}</div>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setShowCustomerModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={statsLoading ? '...' : stats?.totalCustomers || 0}
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Campaigns"
          value={statsLoading ? '...' : stats?.activeCampaigns || 0}
          icon={EnvelopeIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Total Delivered"
          value={statsLoading ? '...' : stats?.totalDelivered || 0}
          icon={CursorArrowRaysIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Engagement Rate"
          value={statsLoading ? '...' : `${stats?.engagementRate || 0}%`}
          icon={ChartBarIcon}
          color="bg-indigo-500"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dummyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="delivered" fill="#8884d8" name="Messages Delivered" />
              <Bar dataKey="campaigns" fill="#82ca9d" name="Campaigns" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Campaigns</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {campaignsLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : recentCampaigns?.length ? (
            recentCampaigns.map((campaign: any) => (
              <div key={campaign._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">
                      Sent to {campaign.stats?.audienceSize || 0} customers
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">No recent campaigns</div>
          )}
        </div>
      </div>

      {/* Customers Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customers</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {customersLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : customers?.length ? (
            customers.map((customer: any) => (
              <div key={customer._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{customer.firstName} {customer.lastName}</h3>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {customer.customerSegment}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">No customers found</div>
          )}
        </div>
      </div>
    </div>
  );
}
