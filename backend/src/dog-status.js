// Derive public availability from permanent placement and sponsorship dates without mutating the stored record.
// Permanent placement and six-month virtual sponsorship are independent states.
export function dogStatus(record, now = new Date()) {
  // Work on a copy so callers keep the original persisted profile.
  const dog = { ...record };
  if (["max", "rocky"].includes(dog.id) && dog.mock)
    dog.image = `/public/assets/dogs/profiles/${dog.id}.jpg?v=breed-corrected-3`;
  dog.permanentAdoptionDate = dog.permanentAdoptionDate || null;
  dog.sponsorshipStartedAt =
    dog.sponsorshipStartedAt || (dog.mock ? dog.adoptionDate : null) || null;
  // Derive a missing end date using six UTC calendar months, not a fixed number of days.
  if (dog.sponsorshipStartedAt && !dog.sponsorshipEndsAt) {
    const end = new Date(`${dog.sponsorshipStartedAt}T00:00:00Z`);
    end.setUTCMonth(end.getUTCMonth() + 6);
    dog.sponsorshipEndsAt = end.toISOString().slice(0, 10);
  }
  dog.sponsorshipStatus =
    dog.sponsorshipEndsAt &&
    new Date(`${dog.sponsorshipEndsAt}T00:00:00Z`) > now
      ? "active"
      : "none";
  dog.placementStatus = dog.permanentAdoptionDate
    ? "permanently_adopted"
    : "in_care";
  // Permanent placement always makes a dog unavailable, even after a virtual sponsorship expires.
  dog.available =
    dog.placementStatus === "in_care" && dog.sponsorshipStatus !== "active";
  // Remove the ambiguous legacy date from the public response in favor of explicit sponsorship fields.
  dog.adoptionDate = null;
  if (dog.mock && dog.sponsorshipStartedAt)
    dog.story = dog.story.replace(
      /[^.]*found a forever home[^.]*\./g,
      ` ${dog.name} is supported through virtual sponsorship while waiting for a permanent home.`,
    );
  return dog;
}
