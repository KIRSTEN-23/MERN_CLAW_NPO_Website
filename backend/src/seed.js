import { dogStatus } from './dog-status.js';
// Fictional demo records, based on the worker gallery. Dates and stories are mock data.
const rows = [
 ['bella','Bella','Boerboel',84,'Large','Female','2026-03-12','2026-08-17','Gentle and affectionate','Quiet walks and companionship'],
 ['max','Max','Border Collie',24,'Medium','Male','2026-04-23',null,'Curious and quick to learn','Puzzle toys and fetch'],
 ['rocky','Rocky','Rottweiler',72,'Large','Male','2026-02-06',null,'Calm and loyal','Steady walks and familiar people'],
 ['cooper','Cooper','Boerboel',0.5,'Small','Male','2026-09-25',null,'Sleepy and playful','Short play sessions and naps'],
 ['duke','Duke','German Shepherd',144,'Large','Male','2025-11-19','2026-06-03','Patient and observant','Gentle strolls and soft beds'],
 ['simba','Simba','Golden Retriever',48,'Large','Male','2026-05-08',null,'Friendly and sociable','Fetching balls and meeting volunteers'],
 ['daisy','Daisy','Rottweiler',6,'Medium','Female','2026-07-16',null,'Bouncy and inquisitive','Learning new games'],
 ['mia','Mia','Unknown',12,'Small','Female','2026-08-04',null,'Shy and sweet','Quiet company and gentle introductions'],
 ['zoe','Zoe','Boxer',48,'Medium','Female','2026-01-28','2026-09-11','Playful and expressive','Outdoor games and cuddles'],
 ['honey','Honey','Boerboel',48,'Large','Female','2026-06-14',null,'Affectionate and relaxed','Sunny spots and leisurely walks'],
];
export const seedDogs = rows.map(([id,name,breed,ageMonths,size,sex,intakeDate,adoptionDate,temperament,likes],i)=>dogStatus({
 id,name,breed,ageMonths,age: ageMonths < 12 ? `${ageMonths < 1 ? '2 weeks' : ageMonths + ' months'}` : `${ageMonths/12} years`,
 size,sex,intakeDate,adoptionDate,available: !adoptionDate,
 image: `/public/assets/dogs/profiles/${id}.jpg?v=figma-gallery-2`,
 energyLevel: i===1 || i===6 || i===8 ? 'High' : i===4 ? 'Low' : 'Medium',
 goodWithPeople:'Yes, with gentle introductions', goodWithAnimals:i===2 ? 'Prefers a home without other animals' : 'Yes, with supervised introductions',
 location:'CLAW Animal Shelter', adoptionModel:'Virtual adoption',
 overview:`${name} is a ${temperament.toLowerCase()} ${breed === 'Unknown' ? 'mixed-breed dog' : breed}. ${likes} make ${name} happy. Our volunteers are helping ${name} build confidence through a predictable routine and kind, patient handling.`,
 story:`${name} arrived at CLAW on ${intakeDate} after needing a safe place and dedicated care. With regular meals, veterinary attention and time with volunteers, ${name} has settled into shelter life. ${adoptionDate ? `${name} found a forever home on ${adoptionDate}.` : `Virtual support helps us care for ${name} while we look for a suitable forever home.`}`,
 personality:[temperament,likes,'Responds to patient handling', i===4 ? 'Enjoys a quieter routine' : 'Enjoys time with volunteers'],
 mock:true,
}));
