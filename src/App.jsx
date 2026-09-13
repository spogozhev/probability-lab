import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import BasicProbability from './pages/BasicProbability.jsx'
import ProbabilityDistributions from './pages/ProbabilityDistributions.jsx'
import CompoundProbability from './pages/CompoundProbability.jsx'
import FrequentistInference from './pages/FrequentistInference.jsx'
import BayesianInference from './pages/BayesianInference.jsx'
import RegressionAnalysis from './pages/RegressionAnalysis.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="basic" element={<BasicProbability />} />
        <Route path="distributions" element={<ProbabilityDistributions />} />
        <Route path="compound" element={<CompoundProbability />} />
        <Route path="frequentist" element={<FrequentistInference />} />
        <Route path="bayesian" element={<BayesianInference />} />
        <Route path="regression" element={<RegressionAnalysis />} />
      </Route>
    </Routes>
  )
}

export default App
