export function generateCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(",")];
  
  for (const item of data) {
    const row = headers.map((header) => {
      const value = item[header] ?? "";
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    rows.push(row.join(","));
  }
  
  return rows.join("\n");
}
