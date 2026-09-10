import type { IdentityRecord } from "@resolve/types";

// Helper to keep ID generation consistent across the app
export const getPersonId = (name: string, workspaceId: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `person-${slug}-${workspaceId}`;
};

function randomIndustry() {
  const industry: IdentityRecord["industry"][] = ["Manufacturing", "Energy"];
  return industry[Math.floor(Math.random() * industry.length)];
}

function randomStatus() {
  return Math.random() < 0.85 ? "Active" as const : "Inactive" as const;
}

const companies = [
  "Apex Dynamics",
  "NexaCore Technologies",
  "Aether Industries",
  "OmniSolutions Group",
  "Vortex Solutions",
  "Synapse Robotics",
  "Horizon Logistics",
  "Quantum Leap Analytics",
  "Elysium Pharmaceuticals",
  "Stellaris Financial",
  "Vertex Innovations",
  "Nebula Systems",
  "Terraform Engineering",
  "Prism Security",
  "Echo Media Group",
  "Vertex Global",
  "Aurora Energy",
  "Nexus Labs",
  "Catalyst Dynamics",
  "Prime Synergy",
  "Novus Ventures",
  "Vector Industries",
  "Apex Holdings",
  "Quantum Dynamics",
  "Synapse Systems",
  "Horizon Dynamics",
  "Vortex Innovations",
  "OmniCore",
  "Aether Solutions",
  "Stellaris Technologies",
  "Vertex Engineering",
  "Nebula Solutions",
  "Terraform Logistics",
  "Prism Dynamics",
  "Echo Industries",
  "Novus Technologies",
  "Vector Global",
  "Prime Dynamics",
  "Catalyst Systems",
  "Apex Solutions",
  "Quantum Innovations",
  "Synapse Logistics",
  "Horizon Solutions",
  "Vortex Global",
  "OmniDynamics",
  "Aether Tech",
  "Stellaris Solutions",
  "Vertex Dynamics",
  "Nebula Technologies",
  "Terraform Systems"
];

const men = ["Liam Smith", "Noah Williams", "Oliver Jones", "Elijah Miller", "James Rodriguez", "William Hernandez", "Benjamin Gonzalez", "Lucas Anderson", "Henry Taylor", "Alexander Jackson", "Mason Lee", "Michael Thompson", "Ethan Harris", "Daniel Clark", "Jacob Lewis", "Logan Walker", "Jackson Allen", "Levi Wright", "Sebastian Torres", "Mateo Hill", "Jack Green", "Owen Nelson", "Theodore Hall", "Aiden Campbell", "Samuel Carter", "Gabriel Gomez", "Carter Evans", "Anthony Diaz", "Isaac Cruz", "Dylan Collins", "Ezra Morris", "Thomas Murphy", "Charles Rogers", "Christopher Ortiz", "Jaxon Cooper", "Maverick Bailey", "Luke Kelly", "Hudson Ramos", "Ian Cox", "Nathan Richardson", "Christian Brooks", "Andrew Wood", "Lincoln Bennett", "Joshua Mendoza", "Leo Hughes", "Aaron Alvarez", "Roman Sanders", "Eli Myers", "Ryan Ross", "Nolan Jimenez"];

const women = ["Olivia Johnson", "Amelia Brown", "Charlotte Garcia", "Sophia Davis", "Ava Martinez", "Isabella Lopez", "Mia Wilson", "Evelyn Thomas", "Harper Moore", "Luna Martin", "Ella Perez", "Gianna White", "Aria Sanchez", "Chloe Ramirez", "Scarlett Robinson", "Penelope Young", "Layla King", "Mila Scott", "Nora Nguyen", "Hazel Flores", "Zoe Adams", "Riley Baker", "Stella Rivera", "Lily Mitchell", "Violet Roberts", "Aurora Phillips", "Grace Turner", "Ellie Parker", "Hannah Edwards", "Emery Stewart", "Victoria Morales", "Zara Cook", "Lucy Gutierrez", "Piper Morgan", "Leilani Peterson", "Sadie Reed", "Naomi Howard", "Addison Kim", "Isabelle Ward", "Natalie Watson", "Maya Chavez", "Audrey James", "Brooklyn Gray", "Bella Ruiz", "Skylar Price", "Lucy Castillo", "Paisley Patel", "Everly Long", "Anna Foster", "Caroline Powell"];


// Arrays contain AI generated photos for representing fictional names above 
const mLength = 20;
const menPics = Array.from({ length: mLength }, (_, i) => `man${String(i + 1).padStart(2, '0')}`);

const wLength = 20;
const womenPics = Array.from({ length: wLength }, (_, i) => `woman${String(i + 1).padStart(2, '0')}`);

// 1. Helper outside the function (Standard Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}


function generateCompanies(workspaceId: string, shuffledNames: string[]) {
  return Array.from({ length: 40 }).map(() => {
    const companyId = `company-${crypto.randomUUID()}`;
    // Fallback name if the 50 names run out
    const name = shuffledNames.pop() || `Company ${crypto.randomUUID().slice(0, 5)}`;
    return {
      id: companyId,
      workspaceId: workspaceId,
      name,
      type: "Company" as const,
      status: randomStatus(),
      industry: randomIndustry(),
      country: "US",
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
    };
  });
}

function generatePeople(
  workspaceId: string, 
  companyId: string, 
  peoplePool: { name: string, gender: string }[], 
  mPics: string[], 
  wPics: string[]
) {
  const count = Math.floor(Math.random() * 3) + 1;

  return Array.from({ length: count }).map(() => {
    // Take the next person from the workspace pool
    const person = peoplePool.pop();
    // If we run out of names, we create a generic fallback object
    const name = person?.name || `Contact ${Math.floor(Math.random() * 1000)}`;
    const gender = person?.gender || (Math.random() > 0.5 ? 'man' : 'woman');

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // 50% chance for a photo
    let avatarKey = "";
    if (Math.random() > 0.5) {
      const picPool = gender === 'man' ? mPics : wPics;
      avatarKey = picPool.pop() || "";
    }

    return {
      id: `person-${slug}-${workspaceId}`,
      workspaceId,
      name,
      personKey: slug,
      type: "Individual" as const,
      status: randomStatus(),
      companyId,
      country: "US",
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      avatarKey
    };
  }).filter(Boolean) as IdentityRecord[]; // Clean up any nulls if we ran out of names
}


export function generateIdentities(workspaceId: string) {
  // 2. SHUFFLE ONCE PER WORKSPACE
  // We create a pool of objects that "know" their gender already
  const peoplePool = shuffle([
    ...men.map(name => ({ name, gender: 'man' })),
    ...women.map(name => ({ name, gender: 'woman' }))
  ]);
  
  const mPics = shuffle(menPics);
  const wPics = shuffle(womenPics);
  const companyNames = shuffle(companies);

  // 3. Generate Companies (passing the shuffled company names)
  const companiesArray = generateCompanies(workspaceId, companyNames);
  const peopleArray: IdentityRecord[] = [];

  // 4. Generate People (they "consume" from the same peoplePool)
  companiesArray.forEach((company) => {
    // We pass the same peoplePool to every call
    const companyPeople = generatePeople(
      workspaceId, 
      company.id, 
      peoplePool, 
      mPics, 
      wPics
    );
    peopleArray.push(...companyPeople);
  });

  return [...companiesArray, ...peopleArray];
}