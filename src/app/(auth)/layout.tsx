export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        <div className="auth-layout__card">
          <div className="auth-layout__logo">
            <span className="auth-layout__logo-icon">💰</span>
            <h1 className="auth-layout__logo-text">Track Money Bro</h1>
            <p className="auth-layout__logo-tagline">
              Your intentional spending journal
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
