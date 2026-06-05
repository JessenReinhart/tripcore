import { useState, useEffect, useRef, useCallback } from "react";
import { searchPlaces, type PlaceSuggestion } from "../../lib/geocode";

export function usePlaceSearch(initialLocation?: string) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDisplayName, setSelectedDisplayName] = useState(initialLocation ?? "");
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const places = await searchPlaces(query);
      setResults(places);
      setIsOpen(places.length > 0);
      setIsSearching(false);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((place: PlaceSuggestion) => {
    setSelectedDisplayName(place.displayName);
    setQuery("");
    setIsOpen(false);
    setResults([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDisplayName("");
  }, []);

  return {
    query, setQuery,
    results,
    isOpen,
    isSearching,
    selectedDisplayName,
    containerRef,
    handleSelect,
    clearSelection,
  };
}
