import { AggregatedBA, CsvRow } from '../types';

// Helper to calculate standard deviation
const calculateStdDev = (values: number[], mean: number): number => {
  if (values.length === 0) return 0;
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
};

export const parseAndAggregateCSV = async (file: File): Promise<AggregatedBA[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("File is empty");

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error("Invalid CSV format");

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Identify relevant columns
        // Priority: 'BA' or 'Business Area' for key
        // Priority: 'Amount', 'DMBTR', 'Value', 'Net Value' for value
        const baKeyIndex = headers.findIndex(h => /ba|business\s?area/i.test(h));
        const amountKeyIndex = headers.findIndex(h => /amount|dmbtr|value|net/i.test(h));

        if (baKeyIndex === -1) throw new Error("Could not find 'BA' or 'Business Area' column.");
        
        // Temporary storage for aggregation
        const groups: Record<string, number[]> = {};

        for (let i = 1; i < lines.length; i++) {
          // Simple CSV split (handling quotes crudely for this demo)
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          
          if (cols.length !== headers.length) continue; // Skip malformed rows

          const ba = cols[baKeyIndex];
          let amount = 0;

          if (amountKeyIndex !== -1) {
            const rawAmount = cols[amountKeyIndex];
            amount = parseFloat(rawAmount.replace(/,/g, '')) || 0;
          } else {
            // If no amount column, treat each row as value 1 (count only)
            amount = 1;
          }

          if (!groups[ba]) {
            groups[ba] = [];
          }
          groups[ba].push(amount);
        }

        // Aggregate features
        const aggregated: AggregatedBA[] = Object.keys(groups).map(ba => {
          const amounts = groups[ba];
          const totalAmount = amounts.reduce((a, b) => a + b, 0);
          const count = amounts.length;
          const avg = totalAmount / count;
          const stdDev = calculateStdDev(amounts, avg);

          return {
            ba,
            totalAmount,
            transactionCount: count,
            avgAmount: avg,
            stdDevAmount: stdDev
          };
        });

        resolve(aggregated);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};