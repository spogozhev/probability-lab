import { Link } from 'react-router-dom'
import { Dices, BarChart3, Layers, Ruler, Brain, TrendingUp } from 'lucide-react'

const sections = [
  {
    to: '/basic',
    title: 'Основы теории вероятностей',
    description: 'Случайные события, математическое ожидание и дисперсия. Монета, кубик и колода карт.',
    color: 'amber',
    icon: Dices,
  },
  {
    to: '/distributions',
    title: 'Вероятностные распределения',
    description: 'Случайные величины, дискретные и непрерывные распределения, центральная предельная теорема.',
    color: 'emerald',
    icon: BarChart3,
  },
  {
    to: '/compound',
    title: 'Вероятность сложного события',
    description: 'Множества и круги Венна, комбинаторика, условная вероятность и сужение выборочного пространства.',
    color: 'violet',
    icon: Layers,
  },
  {
    to: '/frequentist',
    title: 'Частотный вывод',
    description: 'Точечное оценивание, доверительные интервалы и бутстрэп: свойства оценок из данных.',
    color: 'rose',
    icon: Ruler,
  },
  {
    to: '/bayesian',
    title: 'Байесовский вывод',
    description: 'Теорема Байеса, функция правдоподобия, обновление априорных убеждений данными.',
    color: 'teal',
    icon: Brain,
  },
  {
    to: '/regression',
    title: 'Регрессионный анализ',
    description: 'Метод наименьших квадратов, корреляция и дисперсионный анализ (ANOVA).',
    color: 'cyan',
    icon: TrendingUp,
  },
]

const colorMap = {
  amber: 'border-amber-200 hover:border-amber-400 bg-amber-50',
  emerald: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50',
  violet: 'border-violet-200 hover:border-violet-400 bg-violet-50',
  rose: 'border-rose-200 hover:border-rose-400 bg-rose-50',
  teal: 'border-teal-200 hover:border-teal-400 bg-teal-50',
  cyan: 'border-cyan-200 hover:border-cyan-400 bg-cyan-50',
}

const titleColorMap = {
  amber: 'text-amber-700',
  emerald: 'text-emerald-700',
  violet: 'text-violet-700',
  rose: 'text-rose-700',
  teal: 'text-teal-700',
  cyan: 'text-cyan-700',
}

const iconColorMap = {
  amber: 'text-amber-600',
  emerald: 'text-emerald-600',
  violet: 'text-violet-600',
  rose: 'text-rose-600',
  teal: 'text-teal-600',
  cyan: 'text-cyan-600',
}

function HomePage() {
  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Теория вероятностей :: Интерактивные примеры
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Изучайте ключевые концепции теории вероятностей и статистики через интерактивные
          визуализации. Меняйте параметры экспериментов и наблюдайте за поведением случайности.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.to}
              to={section.to}
              className={`block p-6 rounded-xl border-2 transition-all hover:shadow-lg ${colorMap[section.color]}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-6 h-6 ${iconColorMap[section.color]}`} />
                <h2 className={`text-xl font-semibold ${titleColorMap[section.color]}`}>
                  {section.title}
                </h2>
              </div>
              <p className="text-gray-600 text-sm">{section.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default HomePage
