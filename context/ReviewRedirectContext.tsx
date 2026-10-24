import React, { createContext, useEffect, useMemo, useState } from 'react';

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/diamantepinturasoaxaca';
const REDIRECT_DELAY_MS = 60_000;

interface ReviewRedirectContextValue {
  secondsRemaining: number;
}

export const ReviewRedirectContext = createContext<ReviewRedirectContextValue>({
  secondsRemaining: 60,
});

export const ReviewRedirectProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    const redirectTimeout = window.setTimeout(() => {
      window.location.assign(FACEBOOK_PAGE_URL);
    }, REDIRECT_DELAY_MS);

    const countdownInterval = window.setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1_000);

    return () => {
      window.clearTimeout(redirectTimeout);
      window.clearInterval(countdownInterval);
    };
  }, []);

  const value = useMemo(() => ({ secondsRemaining }), [secondsRemaining]);

  return (
    <ReviewRedirectContext.Provider value={value}>
      {children}
    </ReviewRedirectContext.Provider>
  );
};
