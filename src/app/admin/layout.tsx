import Link from 'next/link';

export const metadata = {
  title: 'Admin Panel | Track Money Bro',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      <nav className="admin-layout__nav">
        <div className="admin-layout__nav-brand">
          <Link href="/dashboard" className="admin-layout__back">
            ← Back to App
          </Link>
          <span className="admin-layout__nav-title">👑 Admin Panel</span>
        </div>
        <div className="admin-layout__nav-links">
          <Link href="/admin/users" className="admin-layout__nav-link">
            User Management
          </Link>
        </div>
      </nav>
      <main className="admin-layout__content">{children}</main>
    </div>
  );
}
