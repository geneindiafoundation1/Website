/**
 * Which field motif a director gets. Kept out of the canvas component because
 * that one is a client component, and the team page picks the motif on the
 * server while rendering the list.
 */

export type GlyphKind = "heart" | "neuron" | "chip";

/**
 * Directors are stored in the database, so the motif is chosen from the role
 * and tags rather than hard-coded per person. Anything that doesn't read as
 * medicine or life sciences falls through to the technology motif.
 */
export function glyphFor(role: string, tags?: string[] | null): GlyphKind {
  const hay = `${role} ${(tags ?? []).join(" ")}`.toLowerCase();
  if (/cardio|heart|interventional/.test(hay)) return "heart";
  if (/neuro|brain|biolog|cell|genom|medicine|clinic/.test(hay)) return "neuron";
  return "chip";
}
