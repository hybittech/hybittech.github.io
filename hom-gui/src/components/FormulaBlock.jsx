import { useEffect, useRef } from 'react';
import katex from 'katex';

export default function FormulaBlock({ tex, display = false, align = 'center', className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && tex) {
      try {
        katex.render(tex, ref.current, {
          throwOnError: false,
          // If we want left alignment, we must use inline mode (displayMode: false) 
          // to prevent KaTeX from forcing its own center alignment.
          displayMode: align === 'left' ? false : display,
        });
      } catch {
        ref.current.textContent = tex;
      }
    }
  }, [tex, display]);

  const alignmentClass = display ? (align === 'left' ? 'text-left' : 'text-center') : '';

  return <span ref={ref} className={`${display ? `block ${alignmentClass} my-3 overflow-x-auto` : 'inline'} ${className}`} />;
}
