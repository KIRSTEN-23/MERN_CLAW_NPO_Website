// Explicit, local-only sample data. Stable IDs make repeat runs safe and preserve edited records.
import { createHash, randomBytes, scryptSync } from 'node:crypto';
import { seedDogs } from './seed.js';
const idFor = name => {
  const hash = createHash('sha256').update(`claw-worker-seed-v1:${name}`).digest('hex');
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
};
export function workerSeedData(now = new Date()) {
  const month = now.toISOString().slice(0,7);
  const staff = [
    ['louise.deville','Louise de Ville','editor'], ['jason.mamoa','Jason Mamoa','editor'],
    ['jackson.pollock','Jackson Pollock','editor'], ['eric.potter','Eric Potter','viewer'],
  ].map(([username,name,role]) => ({ id: idFor(username), username, name, role, email: `${username}@example.test` }));
  const animals = [['zara','Zara','mia',null],['dash','Dash','max',null],['storm','Storm','rocky',null],['poppy','Poppy','zoe',`${month}-10`],['teddy','Teddy','cooper',`${month}-12`]].map(([slug,name,source,permanentAdoptionDate],index) => {
    const base = seedDogs.find(d => d.id === source);
    return { ...base, id: `worker-${slug}`, name, intakeDate: `${month}-01`, permanentAdoptionDate,
      sponsorshipStartedAt: null, sponsorshipEndsAt: null, adoptionDate: null, revision: 0,
      overview: `${name} is a ${base.breed.toLowerCase()} in CLAW's care. Patient handling and a predictable routine help ${name} feel at home.`,
      story: `${name} arrived at CLAW for shelter, veterinary care and a fresh start. ${permanentAdoptionDate ? `${name} has now found a permanent home.` : 'The team is helping them prepare for a loving permanent home.'}`,
      mock: true,
    };
  });
  const requests = [
    ['bella','Sarah Smith','sarah.smith@example.test',50000,'paid'],
    ['duke','James Brown','james.brown@example.test',70000,'paid'],
    ['zoe','Michael Lee','michael.lee@example.test',15000,'paid'],
    ['worker-zara','Chloe Williams','chloe.williams@example.test',45000,'pending_payment'],
    ['worker-dash','Jason Daniels','jason.daniels@example.test',60000,'pending_payment'],
    ['worker-storm','Luke Mitchell','luke.mitchell@example.test',23000,'pending_payment'],
  ].map(([dogId,name,email,amount,status],index) => ({ id: idFor(`request-${dogId}`), dogId,name,email,amount,status,createdAt: `${month}-${String(index+1).padStart(2,'0')}T10:00:00.000Z` }));
  return { staff,animals,requests,createdAt: `${month}-01T09:00:00.000Z` };
}

export async function seedWorker(db, now = new Date()) {
  const data = workerSeedData(now), connection = await db.pool.getConnection();
  let added = 0;
  try {
    await connection.beginTransaction();
    // Fail before writes if explicit worker schema setup has not been run.
    await connection.execute('SELECT user_id FROM worker_access LIMIT 1');
    await connection.execute('SELECT contribution_id FROM worker_reviews LIMIT 1');
    const insert = async (sql,args) => { const [result] = await connection.execute(sql,args); added += result.affectedRows; };
    for (const dog of [...seedDogs,...data.animals]) await insert('INSERT IGNORE INTO dogs (id,data) VALUES (?,?)',[dog.id,JSON.stringify(dog)]);
    for (const person of data.staff) {
      const salt = randomBytes(16).toString('hex');
      // These display accounts have unguessable credentials; no shared/default password or admin role.
      const passwordHash = `${salt}:${scryptSync(randomBytes(32).toString('hex'),salt,64).toString('hex')}`;
      await insert('INSERT IGNORE INTO users (id,username,email,password_hash,created_at) VALUES (?,?,?,?,?)',[person.id,person.name,person.email,passwordHash,data.createdAt]);
      const [rows] = await connection.execute('SELECT id FROM users WHERE id=?',[person.id]);
      if (!rows.length) throw new Error('A sample staff identity conflicts with an existing account. No changes were saved.');
      await insert('INSERT IGNORE INTO worker_access (user_id,role,granted_at) VALUES (?,?,?)',[person.id,person.role,data.createdAt]);
    }
    for (const request of data.requests) {
      await insert('INSERT IGNORE INTO contributions (id,user_id,dog_id,amount_cents,frequency,method,name,email,phone,status,created_at,ends_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [request.id,null,request.dogId,request.amount,'monthly','eft',request.name,request.email,null,request.status,request.createdAt,null]);
      if (request.status === 'paid') await insert('INSERT IGNORE INTO worker_reviews (contribution_id,status,note,reviewed_by,reviewed_at) VALUES (?,?,?,?,?)',[request.id,'reviewed','',data.staff[0].id,request.createdAt]);
    }
    await connection.commit();
    return { added };
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
