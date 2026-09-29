'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AccountStatus } from '@/types/database';

interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  account_status: AccountStatus;
  role: string;
  created_at: string;
}

const STATUS_BADGES: Record<AccountStatus, { label: string; className: string }> = {
  pending_approval: { label: '⏳ Pending', className: 'badge--warning' },
  active: { label: '✅ Active', className: 'badge--success' },
  suspended: { label: '🔒 Suspended', className: 'badge--danger' },
  rejected: { label: '❌ Rejected', className: 'badge--danger' },
};

export default function AdminUserList({ initialUsers }: { initialUsers: UserRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState<AccountStatus | 'all'>('pending_approval');
  const [updating, setUpdating] = useState<string | null>(null);

  const filteredUsers = filter === 'all'
    ? users
    : users.filter((u) => u.account_status === filter);

  const pendingCount = users.filter((u) => u.account_status === 'pending_approval').length;

  const updateStatus = async (userId: string, newStatus: AccountStatus) => {
    setUpdating(userId);
    try {
      const res = await fetch('/api/admin/update-user-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, account_status: newStatus } : u
          )
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
    setUpdating(null);
    router.refresh();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-users">
      {/* Filter tabs */}
      <div className="admin-users__filters">
        {(['pending_approval', 'active', 'suspended', 'rejected', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`admin-users__filter-btn ${filter === status ? 'admin-users__filter-btn--active' : ''}`}
          >
            {status === 'all' ? 'All' : STATUS_BADGES[status]?.label || status}
            {status === 'pending_approval' && pendingCount > 0 && (
              <span className="admin-users__count">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Users table */}
      {filteredUsers.length === 0 ? (
        <div className="admin-users__empty">
          <p>No users found with this status.</p>
        </div>
      ) : (
        <div className="admin-users__table-wrapper">
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>DOB</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.account_status === 'pending_approval' ? 'admin-users__row--pending' : ''}>
                  <td className="admin-users__name">
                    {user.first_name} {user.last_name || ''}
                    {user.role === 'superadmin' && (
                      <span className="badge badge--accent" title="Superadmin">👑</span>
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.date_of_birth || '—'}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGES[user.account_status].className}`}>
                      {STATUS_BADGES[user.account_status].label}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td className="admin-users__actions">
                    {user.role !== 'superadmin' && (
                      <>
                        {user.account_status !== 'active' && (
                          <button
                            onClick={() => updateStatus(user.id, 'active')}
                            disabled={updating === user.id}
                            className="admin-btn admin-btn--approve"
                            title="Approve"
                          >
                            ✅ Approve
                          </button>
                        )}
                        {user.account_status !== 'suspended' && user.account_status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(user.id, 'suspended')}
                            disabled={updating === user.id}
                            className="admin-btn admin-btn--suspend"
                            title="Suspend"
                          >
                            🔒 Suspend
                          </button>
                        )}
                        {user.account_status === 'pending_approval' && (
                          <button
                            onClick={() => updateStatus(user.id, 'rejected')}
                            disabled={updating === user.id}
                            className="admin-btn admin-btn--reject"
                            title="Reject"
                          >
                            ❌ Reject
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
