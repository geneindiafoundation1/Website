/**
 * Director messages already published on the foundation YouTube channel.
 * Matched to team members by slug so they appear even when profiles come from
 * the database (which has no video column yet).
 */
export const memberVideos: Record<string, { id: string; title: string }> = {
  "upendra-kaul": {
    id: "SxLtslR6cdI",
    title: "Director's message - Padma Shri Dr. Upendra Kaul",
  },
  "tanzila-mukhtar": {
    id: "yAf77syN_H0",
    title: "Director's message - Dr. Tanzila Mukhtar",
  },
};
