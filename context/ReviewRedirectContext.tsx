import React, { createContext, useEffect, useMemo, useState } from 'react';

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/diamantepinturasoaxaca';
const REDIRECT_DELAY_SECONDS = 5;

interface ReviewRedirectContextValue {
  secondsRemaining: number | null;
  startFacebookRedirect: () => void;
  cancelFacebookRedirect: () => void;
}

export const ReviewRedirectContext = createContext<ReviewRedirectContextValue>({
  secondsRemaining: null,
  startFacebookRedirect: () => {},
  cancelFacebookRedirect: () => {}
});

export const ReviewRedirectProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (secondsRemaining === null) return;

    if (secondsRemaining === 0) {
      window.location.assign(FACEBOOK_PAGE_URL);
      return;
    }

    const countdownTimeout = window.setTimeout(() => {
      setSecondsRemaining(secondsRemaining - 1);
    }, 1_000);

    return () => window.clearTimeout(countdownTimeout);
  }, [secondsRemaining]);

  const value = useMemo(() => ({
    secondsRemaining,
    startFacebookRedirect: () => setSecondsRemaining(REDIRECT_DELAY_SECONDS),
    cancelFacebookRedirect: () => setSecondsRemaining(null)
  }), [secondsRemaining]);

  return (
    <ReviewRedirectContext.Provider value={value}>
      {children}
    </ReviewRedirectContext.Provider>
  );
};
