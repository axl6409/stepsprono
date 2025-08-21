// useCanGoBack.js
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useCanGoBack() {
  const [canGoBack, setCanGoBack] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const idx = window.history?.state?.idx ?? 0;
    setCanGoBack(idx > 0);
  }, [location.key]);

  return canGoBack;
}
