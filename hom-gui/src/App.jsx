import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Explorer from './pages/Explorer';
import LetterDetail from './pages/LetterDetail';
import Lab from './pages/Lab';
import System from './pages/System';
import Documentation from './pages/Documentation';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/explorer/:letter" element={<LetterDetail />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/system" element={<System />} />
        <Route path="/docs" element={<Documentation />} />
      </Routes>
    </Layout>
  );
}
