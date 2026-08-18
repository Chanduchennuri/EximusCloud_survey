import Logo from "./Logo";

function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <Logo />
        <span className="hidden sm:block text-sm text-gray-500">
          Industry Research Study
        </span>
      </div>
    </header>
  );
}

export default Navbar;