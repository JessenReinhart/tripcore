import { useState, useEffect, useCallback } from "react";
import { Trip, Member } from "../types";
import { saveTrip } from "../lib/firebase";
import { hashPin } from "../lib/crypto";

export function useTripIdentity(
  trip: Trip | null,
  firebaseUid: string | null,
  resolvedTripId: string | null,
) {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);

  // Resolve identity when trip + firebaseUid are ready
  useEffect(() => {
    if (!trip || !firebaseUid) return;

    const storedUserId = localStorage.getItem(`trip_user_${trip.id}`);
    if (storedUserId) {
      const member = trip.members.find(m => m.id === storedUserId);
      if (member) { setCurrentUser(member); return; }
    }

    const memberByUid = trip.members.find(m => m.firebaseUid === firebaseUid);
    if (memberByUid) {
      localStorage.setItem(`trip_user_${trip.id}`, memberByUid.id);
      setCurrentUser(memberByUid);
      return;
    }

    if (trip.members.length > 0) {
      setIsMemberPickerOpen(true);
    } else {
      setIsNameModalOpen(true);
    }
  }, [trip, firebaseUid]);

  const handleNameJoin = useCallback(async (name: string, pin: string) => {
    if (!trip || !resolvedTripId) return;
    const pinHashStr = await hashPin(pin);
    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      totalContributed: 0,
      firebaseUid: firebaseUid ?? undefined,
      pinHash: pinHashStr,
    };
    localStorage.setItem(`trip_user_${resolvedTripId}`, newMember.id);
    saveTrip(resolvedTripId, { ...trip, members: [...trip.members, newMember] });
    setIsNameModalOpen(false);
  }, [trip, resolvedTripId, firebaseUid]);

  const handleReclaimMember = useCallback((member: Member, upgradedPinHash?: string) => {
    if (!trip || !resolvedTripId || !firebaseUid) return;
    const updatedMembers = trip.members.map((m) => {
      if (m.id !== member.id) return m;
      const updates: Partial<Member> = { firebaseUid };
      if (upgradedPinHash) updates.pinHash = upgradedPinHash;
      return { ...m, ...updates };
    });
    localStorage.setItem(`trip_user_${resolvedTripId}`, member.id);
    saveTrip(resolvedTripId, { ...trip, members: updatedMembers });
    setIsMemberPickerOpen(false);
  }, [trip, resolvedTripId, firebaseUid]);

  const handleNewMemberFromPicker = useCallback(() => {
    setIsMemberPickerOpen(false);
    setIsNameModalOpen(true);
  }, []);

  return {
    currentUser,
    isNameModalOpen,
    isMemberPickerOpen,
    setIsNameModalOpen,
    setIsMemberPickerOpen,
    handleNameJoin,
    handleReclaimMember,
    handleNewMemberFromPicker,
  };
}
