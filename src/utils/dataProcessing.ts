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
      
      cleaned = cleaned.map(row => {
        if (row[col] === null || row[col] === undefined || row[col] === '') {
          nullsFilled++;
          return { ...row, [col]: Number(mean.toFixed(2)) };
        }
        return row;
      });
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
