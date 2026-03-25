import { MASTER_TABLE } from '../engine/masterTable';
import LetterCard from '../components/LetterCard';

export default function Explorer() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Letter Explorer</h1>
        <p className="text-sm text-hom-muted mt-1">
          Browse all 28 canonical Hijaiyyah letters · Click to inspect full codex profile
        </p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
        {MASTER_TABLE.map((entry) => (
          <LetterCard key={entry.char} entry={entry} />
        ))}
      </div>
    </div>
  );
}
