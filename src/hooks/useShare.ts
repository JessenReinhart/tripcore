import { useState, useCallback } from "react";
import { Trip } from "../types";

export function useShare(trip: Trip | null, t: (key: string) => string) {
  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = trip?.slug
    ? `${window.location.origin}/trip/${trip.slug}`
    : window.location.href;

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: trip?.title || t('defaultTripName'),
          text: `${t('joinOurTrip')} ${trip?.title}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  }, [trip, t, shareUrl]);

  return { shareUrl, isCopied, handleShare };
}
