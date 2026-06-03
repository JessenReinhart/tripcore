import { useState, useEffect } from "react";
import { Trip } from "../types";
import { ensureAuth, subscribeToTrip, saveTrip, resolveSlug } from "../lib/firebase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useTripSubscription(
  tripId: string | undefined,
  slugFromState: string | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  const [resolvedTripId, setResolvedTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);

  // Resolve trip ID (UUID or slug)
  useEffect(() => {
    if (!tripId) return;
    if (UUID_RE.test(tripId)) {
      setResolvedTripId(tripId);
    } else {
      resolveSlug(tripId).then((id) => {
        if (id) {
          setResolvedTripId(id);
        } else {
          setResolvedTripId(crypto.randomUUID());
        }
      });
    }
  }, [tripId]);

  // Subscribe to Firestore
  useEffect(() => {
    if (!resolvedTripId) return;
    let unsubscribe: (() => void) | undefined;

    ensureAuth().then((uid) => {
      setFirebaseUid(uid);

      unsubscribe = subscribeToTrip(resolvedTripId, (remoteTrip) => {
        if (remoteTrip) {
          const migrated = { ...remoteTrip };
          if (migrated.savingTargetPerMember === undefined) {
            migrated.savingTargetPerMember = 1000000;
          }
          migrated.members = migrated.members.map((m) => ({
            ...m,
            totalContributed: m.totalContributed || 0,
          }));
          setTrip(migrated);
        } else {
          const newTrip: Trip = {
            id: resolvedTripId,
            title: t('defaultTripTitle'),
            slug: slugFromState || tripId,
            savingTargetPerMember: 1000000,
            members: [],
            expenses: [],
            itinerary: [
              { id: crypto.randomUUID(), dateLabel: t('dayLabel', { number: 1 }), activities: [] }
            ],
            checklist: [],
            createdAt: Date.now(),
          };
          saveTrip(resolvedTripId, newTrip);
        }
      });
    });

    return () => { unsubscribe?.(); };
  }, [resolvedTripId]);

  return { resolvedTripId, trip, firebaseUid, setTrip };
}
