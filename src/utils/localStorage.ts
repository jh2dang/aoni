import type { CharacterInfoResponse, CharacterEquipmentResponse } from "../types";

export interface MyCharacter {
  characterId: string;
  serverId: number;
  infoData: CharacterInfoResponse;
  equipmentData: CharacterEquipmentResponse;
  savedAt: string;
}

const MY_CHARACTER_KEY = "myCharacter";

export function saveMyCharacter(
  characterId: string,
  serverId: number,
  infoData: CharacterInfoResponse,
  equipmentData: CharacterEquipmentResponse
): void {
  const myCharacter: MyCharacter = {
    characterId,
    serverId,
    infoData,
    equipmentData,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(MY_CHARACTER_KEY, JSON.stringify(myCharacter));
}

export function getMyCharacter(): MyCharacter | null {
  const stored = localStorage.getItem(MY_CHARACTER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as MyCharacter;
  } catch {
    return null;
  }
}

export function hasMyCharacter(): boolean {
  return getMyCharacter() !== null;
}

export function removeMyCharacter(): void {
  localStorage.removeItem(MY_CHARACTER_KEY);
}

