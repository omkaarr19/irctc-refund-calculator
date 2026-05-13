import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-blue-600">
          IRCTC Refund
        </Link>

        <div className="flex items-center gap-5 text-sm font-medium text-slate-700">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>

          <Link href="/calculator" className="hover:text-blue-600">
            Calculator
          </Link>

          <Link href="/rules" className="hover:text-blue-600">
            Rules
          </Link>

          <Link href="/about" className="hover:text-blue-600">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}