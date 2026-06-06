import AuthPanel from "./_components/AuthPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Atmosphere panel: full height on desktop, compact banner on mobile */}
      <div className="hidden lg:block lg:w-1/2">
        <AuthPanel />
      </div>
      {/* Mobile brand bar */}
      <div className="block min-h-[120px] max-h-[30vh] lg:hidden">
        <AuthPanel />
      </div>
      {/* Form area */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
