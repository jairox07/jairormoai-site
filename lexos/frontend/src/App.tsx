import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuthStore } from './store/auth.store';
import ResearchPage from './pages/rag/ResearchPage';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  // For MVP, render Research page directly (no auth required in dev mode)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg
                   bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                   hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                   text-gray-700 dark:text-gray-300"
        title="Toggle dark mode"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Main content */}
      <ResearchPage />

      {/* Development info */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 text-xs text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
          v{__APP_VERSION__} · Dev Mode
        </div>
      )}
    </div>
  );
}
