import { useState, useEffect, useRef } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Resolve trip ID (UUID or slug)
  useEffect(() => {
    if (!tripId) return;
    if (UUID_RE.test(tripId)) {
      setResolvedTripId(tripId);
    } else {
      resolveSlug(tripId)
        .then((id) => {
          if (!mountedRef.current) return;
          setResolvedTripId(id || crypto.randomUUID());
        })
        .catch(() => {
          if (!mountedRef.current) return;
          setResolvedTripId(crypto.randomUUID());
        });
    }
  }, [tripId]);

  // Subscribe to Firestore
  useEffect(() => {
    if (!resolvedTripId) return;

    let cancelled = false;
    const unsubscribeRef: { current: (() => void) | undefined } = { current: undefined };

    ensureAuth()
      .then((uid) => {
        if (cancelled || !mountedRef.current) return;
        setFirebaseUid(uid);

        unsubscribeRef.current = subscribeToTrip(resolvedTripId, (remoteTrip) => {
          if (cancelled || !mountedRef.current) return;

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
              title: t("defaultTripTitle"),
              slug: slugFromState || tripId,
              savingTargetPerMember: 1000000,
              members: [],
              expenses: [],
              itinerary: [
                { id: crypto.randomUUID(), dateLabel: t("dayLabel", { number: 1 }), activities: [] },
              ],
              checklist: [],
              createdAt: Date.now(),
            };
            saveTrip(resolvedTripId, newTrip).catch(() => {
              if (!cancelled && mountedRef.current) {
                setError("Failed to create trip. Check your connection.");
              }
            });
          }
          setLoading(false);
        });
      })
      .catch(() => {
        if (cancelled || !mountedRef.current) return;
        setError("Failed to authenticate. Check your connection.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
    };
  }, [resolvedTripId]);

  return { resolvedTripId, trip, firebaseUid, loading, error };
}
