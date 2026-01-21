/**
 * CSV parser utility - extracts emails from CSV format
 * Supports:
 * - Plain email list (one per line)
 * - CSV with multiple columns
 * - Common headers like 'email', 'Email', 'e-mail'
 */
export function parseCSV(csvContent: string): string[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    return [];
  }

  const firstLine = lines[0];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if first line is a header (contains 'email' text)
  const isHeader = /email|e-mail|recipient|address/i.test(firstLine);
  const startIdx = isHeader ? 1 : 0;

  const emails: string[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle comma-separated values
    const parts = line.split(',');
    for (const part of parts) {
      const email = part.trim().toLowerCase();
      // Validate email format
      if (emailRegex.test(email)) {
        emails.push(email);
      }
    }
  }

  return [...new Set(emails)]; // Remove duplicates
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

export function stringifyCSV(data: string[][]): string {
  return data.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}
