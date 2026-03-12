export function processData(rawData: any[]) {
  if (!rawData || rawData.length === 0) return { cleaned: [], stats: { rowsRemoved: 0, nullsFilled: 0 } };

  let rowsRemoved = 0;
  let nullsFilled = 0;
  
  // 1. Remove completely empty rows
  let cleaned = rawData.filter(row => {
    const isEmpty = Object.values(row).every(val => val === null || val === undefined || val === '');
    if (isEmpty) rowsRemoved++;
    return !isEmpty;
  });

  // 2. Fill nulls for numeric columns with mean, and categorical with mode
  const columns = Object.keys(cleaned[0] || {});
  
  columns.forEach(col => {
    const isNumeric = cleaned.some(row => typeof row[col] === 'number' && !isNaN(row[col]));
    
    if (isNumeric) {
      // Calculate mean
      const validVals = cleaned.map(r => r[col]).filter(v => typeof v === 'number' && !isNaN(v));
      const mean = validVals.length > 0 ? validVals.reduce((a, b) => a + b, 0) / validVals.length : 0;
      const roundedMean = Math.round(mean);
      
      cleaned = cleaned.map(row => {
        if (row[col] === null || row[col] === undefined || row[col] === '') {
          nullsFilled++;
          return { ...row, [col]: roundedMean };
        }
        return row;
      });

      // 3. IQR Outlier Removal for this numeric column
      const values = cleaned.map(r => Number(r[col])).filter(v => !isNaN(v)).sort((a, b) => a - b);
      if (values.length > 4) {
        const q1 = values[Math.floor(values.length * 0.25)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const beforeCount = cleaned.length;
        cleaned = cleaned.filter(row => {
          const val = Number(row[col]);
          return val >= lowerBound && val <= upperBound;
        });
        rowsRemoved += (beforeCount - cleaned.length);
      }
    } else {
      // Categorical - fill with 'Unknown' for simplicity
      cleaned = cleaned.map(row => {
        if (row[col] === null || row[col] === undefined || row[col] === '') {
          nullsFilled++;
          return { ...row, [col]: 'Unknown' };
        }
        return row;
      });
    }
  });

  return { cleaned, stats: { rowsRemoved, nullsFilled } };
}
