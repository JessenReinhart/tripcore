import { useState, useEffect, useRef, useCallback } from "react";
import { Trip, type TripUpdateFn } from "../types";
import { ensureAuth, subscribeToTrip, saveTrip, resolveSlug } from "../lib/firebase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useTripSubscription(
  tripId: string | undefined,
  slugFromState: string | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  const [resolvedTripId, setResolvedTripId] = useState<string | null>(null);
  const [firestoreTrip, setFirestoreTrip] = useState<Trip | null>(null);
  const [localTrip, setLocalTrip] = useState<Trip | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Keep refs for values used in the Firestore subscription effect
  // to avoid unnecessary re-subscriptions while always using latest values.
  const tRef = useRef(t);
  tRef.current = t;
  const slugFromStateRef = useRef(slugFromState);
  slugFromStateRef.current = slugFromState;
  const tripIdRef = useRef(tripId);
  tripIdRef.current = tripId;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Sync Firestore state into local state when it changes from the server.
  // This overrides any stale optimistic state once Firestore catches up.
  useEffect(() => {
    setLocalTrip(firestoreTrip);
  }, [firestoreTrip]);

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
            migrated.expenses = migrated.expenses.map((exp) => ({
              ...exp,
              paidFromKas: exp.paidFromKas ?? false,
            }));
            setFirestoreTrip(migrated);
          } else {
            const newTrip: Trip = {
              id: resolvedTripId,
              title: tRef.current("defaultTripTitle"),
              slug: slugFromStateRef.current || tripIdRef.current,
              savingTargetPerMember: 1000000,
              members: [],
              expenses: [],
              itinerary: [
                { id: crypto.randomUUID(), dateLabel: tRef.current("dayLabel", { number: 1 }), date: (() => { const d = new Date(); const pad = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })(), activities: [] },
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

  /** Optimistically update the trip: sets local state immediately, then syncs to Firestore. */
  const updateTripOptimistic: TripUpdateFn = useCallback((updatedTrip: Trip) => {
    setLocalTrip(updatedTrip);
    if (resolvedTripId) {
      saveTrip(resolvedTripId, updatedTrip).catch((err) => {
        console.error("Failed to update trip:", err);
      });
    }
  }, [resolvedTripId]);

  // The effective trip is the local optimistic version, falling back to Firestore state.
  const trip = localTrip ?? firestoreTrip;

  return { resolvedTripId, trip, firebaseUid, loading, error, updateTripOptimistic };
}
