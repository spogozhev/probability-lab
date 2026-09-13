import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Главная', end: true },
  { to: '/basic', label: 'Основы' },
  { to: '/distributions', label: 'Распределения' },
  { to: '/compound', label: 'Сложные события' },
  { to: '/frequentist', label: 'Частотный вывод' },
  { to: '/bayesian', label: 'Байесовский' },
  { to: '/regression', label: 'Регрессия' },
]

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="text-xl font-bold text-indigo-600">
              ProbabilityTheory
            </NavLink>
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <nav className="md:hidden bg-white border-b border-gray-200 px-4 py-2 overflow-x-auto">
        <div className="flex space-x-1 whitespace-nowrap">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          Теория вероятностей :: Интерактивные примеры
        </div>
      </footer>
    </div>
  )
}

export default Layout
