import { useEffect, useRef } from 'react';
import katex from 'katex';

export default function FormulaBlock({ tex, display = false, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && tex) {
      try {
        katex.render(tex, ref.current, {
          throwOnError: false,
          displayMode: display,
        });
      } catch {
        ref.current.textContent = tex;
      }
    }
  }, [tex, display]);

  return <span ref={ref} className={`${display ? 'block text-center my-3' : 'inline'} ${className}`} />;
}
