// Permanent placement and six-month virtual sponsorship are independent states.
export function dogStatus(record, now = new Date()) {
 const dog = {...record};
 if(['max','rocky'].includes(dog.id) && dog.mock) dog.image = `/public/assets/dogs/profiles/${dog.id}.jpg?v=breed-corrected-3`;
 dog.permanentAdoptionDate = dog.permanentAdoptionDate || null;
 dog.sponsorshipStartedAt = dog.sponsorshipStartedAt || (dog.mock ? dog.adoptionDate : null) || null;
 if (dog.sponsorshipStartedAt && !dog.sponsorshipEndsAt) {
  const end = new Date(`${dog.sponsorshipStartedAt}T00:00:00Z`);
  end.setUTCMonth(end.getUTCMonth() + 6);
  dog.sponsorshipEndsAt = end.toISOString().slice(0,10);
 }
 dog.sponsorshipStatus = dog.sponsorshipEndsAt && new Date(`${dog.sponsorshipEndsAt}T00:00:00Z`) > now ? 'active' : 'none';
 dog.placementStatus = dog.permanentAdoptionDate ? 'permanently_adopted' : 'in_care';
 dog.available = dog.placementStatus === 'in_care' && dog.sponsorshipStatus !== 'active';
 dog.adoptionDate = null;
 if (dog.mock && dog.sponsorshipStartedAt) dog.story = dog.story.replace(/[^.]*found a forever home[^.]*\./g, ` ${dog.name} is supported through virtual sponsorship while waiting for a permanent home.`);
 return dog;
}
