import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { checkSlugAvailable, resolveSlug } from "../lib/firebase";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,28}[a-z0-9]$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useTripNavigation(
  t: (key: string) => string,
) {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    setError("");
  }, []);

  const handleCreateTrip = useCallback(async () => {
    const tripId = crypto.randomUUID();
    const customSlug = slug.trim().toLowerCase();

    if (!customSlug) {
      navigate(`/trip/${tripId}`);
      return;
    }

    if (!SLUG_RE.test(customSlug)) {
      setError(t("slugInvalid"));
      return;
    }

    setLoading(true);
    const available = await checkSlugAvailable(customSlug);
    setLoading(false);

    if (!available) {
      setError(t("slugTaken"));
      return;
    }

    navigate(`/trip/${customSlug}`, { state: { tripId, slug: customSlug } });
  }, [slug, navigate, t]);

  const handleJoinTrip = useCallback(async () => {
    const input = slug.trim().toLowerCase();
    if (!input) return;

    setLoading(true);
    setError("");

    if (UUID_RE.test(input)) {
      setLoading(false);
      navigate(`/trip/${input}`);
      return;
    }

    const resolvedId = await resolveSlug(input);
    setLoading(false);

    if (!resolvedId) {
      setError(t("slugNotFound"));
      return;
    }

    navigate(`/trip/${input}`);
  }, [slug, navigate, t]);

  const clearError = useCallback(() => setError(""), []);

  return { slug, setSlug: handleSlugChange, error, loading, clearError, handleCreateTrip, handleJoinTrip };
}
