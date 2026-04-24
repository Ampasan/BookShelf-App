import { useCallback, useEffect, useRef, useState } from 'react';

function toErrorMessage(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err?.message) return err.message;
  return 'Request failed';
}

export default function useFetch(fetcher, deps = []) {
  const mounted = useRef(true);
  const runId = useRef(0);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    const id = (runId.current += 1);
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (!mounted.current || id !== runId.current) return;
      setData(result);
    } catch (e) {
      if (!mounted.current || id !== runId.current) return;
      setError(toErrorMessage(e));
    } finally {
      if (!mounted.current || id !== runId.current) return;
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
    };
  }, deps);

  return { data, loading, error, refetch: run };
}

