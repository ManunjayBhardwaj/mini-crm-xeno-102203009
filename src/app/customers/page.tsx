'use client';

import { useQuery } from 'react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const router = useRouter();
  const { data: customers, isLoading, refetch } = useQuery('allCustomers', async () => {
    const res = await fetch('/api/customers');
    return res.json();
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
    if (res.ok) refetch();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <Link href="/" className="text-indigo-600 hover:underline mb-4 inline-block">← Back to Dashboard</Link>
      <div className="mb-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => router.push('/')}
        >
          Add Customer
        </button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : customers?.length ? (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Segment</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: any) => (
              <tr key={customer._id}>
                <td className="py-2 px-4 border-b">{customer.firstName} {customer.lastName}</td>
                <td className="py-2 px-4 border-b">{customer.email}</td>
                <td className="py-2 px-4 border-b">{customer.customerSegment}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="text-blue-600 hover:underline mr-2"
                    onClick={() => router.push(`/customers/${customer._id}`)}
                  >
                    View
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(customer._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No customers found.</div>
      )}
    </div>
  );
}
