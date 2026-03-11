/**
 * 🗓️ Seasonal Event Config — HeartByte
 * 
 * This is the single source of truth for seasonal features.
 * Toggle `archived`, `load3D`, or `allowInteraction` to control behavior.
 *
 * Future events can be added here:
 *   diwali2025: { archived: false, load3D: true, allowInteraction: true }
 *   christmas2025: { ... }
 *   anniversary: { ... }
 */

export interface SeasonEvent {
  archived: boolean;          // Show archive banner, all content locked to read-only
  load3D: boolean;            // If false, 3D imports never load (lazy-import skipped entirely)
  allowInteraction: boolean;  // If false, no inputs/saves/unlocks work
  label: string;              // Human-friendly label for banners
  year: number;
}

export const SEASON_CONFIG: Record<string, SeasonEvent> = {
  valentine2025: {
    archived: true,
    load3D: false,
    allowInteraction: false,
    label: "Valentine Week",
    year: 2025,
  },

  // Future events — just add here and update CURRENT_EVENT below
  // diwali2025: {
  //   archived: false,
  //   load3D: true,
  //   allowInteraction: true,
  //   label: "Diwali",
  //   year: 2025,
  // },
};

/**
 * Set CURRENT_EVENT to switch which event is "active".
 * Components should always read from SEASON_CONFIG[CURRENT_EVENT].
 */
export const CURRENT_EVENT = "valentine2025";

/** Convenience getter */
export const currentSeason = (): SeasonEvent => SEASON_CONFIG[CURRENT_EVENT];
