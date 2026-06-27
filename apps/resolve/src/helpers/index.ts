export function pickOne<T>(arr: T[]): T {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];    
}

export function getRandomDate(start: string, end: string) {
  const fromTime = new Date(start).getTime();
  const toTime = new Date(end).getTime();
  return new Date(fromTime + Math.random() * (toTime - fromTime));
}

export function generateRandomDateStringPriorTo(providedDateString: string) {
  // 1. Convert the provided date string to a Date object.
  const endDate = new Date(providedDateString);
  
  // 2. Calculate the date one month prior.
  const startDate = new Date(endDate);
  startDate.setMonth(endDate.getMonth() - 1);
  
  // Handle edge cases where the day of the month might not exist in the prior month (e.g., 31 May rolls over to 1 June)
  // The logic below ensures that the date stays within the intended prior month.
  if (startDate.getMonth() === endDate.getMonth()) {
    startDate.setDate(0); // Set to the last day of the previous month.
  }

  // 3. Get the timestamps (milliseconds since epoch) for the start and end dates.
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  // 4. Generate a random timestamp between the two.
  const randomTime = startTime + Math.random() * (endTime - startTime);

  // 5. Create a new Date object from the random timestamp.
  const randomDate = new Date(randomTime);

  // 6. Format the Date object as a string (e.g., "YYYY-MM-DD" or use toLocaleDateString).
  // Using toISOString() and slicing provides a consistent YYYY-MM-DD format.
  return randomDate.toISOString().substring(0, 10);
}

export function getRandomInteger(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is inclusive and the minimum is inclusive
}

export function makeId(prefix: string, index: number) {
  return `${prefix}_${index.toString().padStart(3, "0")}`;
}

export function formatRelative(timestamp: string) {
  return timestamp;
}

export function parseDate(dateString: string) {
  return new Date(dateString).toISOString().split('T')[0];
}

export function groupBy<T, K extends string>(
  items: T[],
  keyGetter: (item: T) => K
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const key = keyGetter(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const toCamelCase = (str: string) => {
  // Regex matches a hyphen or underscore followed by any character
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
};
