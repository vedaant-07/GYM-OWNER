import { useEffect } from 'react';

export default function Se7enFit3DLoader({ onComplete }) {
  useEffect(() => {
    onComplete?.();
  }, [onComplete]);

  return null;
}
