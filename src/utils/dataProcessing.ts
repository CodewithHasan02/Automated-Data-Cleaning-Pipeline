export function processData(rawData: any[]) {
  if (!rawData || rawData.length === 0) return { cleaned: [], stats: { rowsRemoved: 0, nullsFilled: 0 } };

  let nullsFilled = 0;
  
  // 1. Mark completely empty rows
  let cleaned = rawData.map(row => {
    const isEmpty = Object.values(row).every(val => val === null || val === undefined || val === '');
    return { 
      ...row, 
      _isDeleted: isEmpty,
      _cleaningLogs: isEmpty ? ['Empty row'] : [] 
    };
  });

  const columns = Object.keys(rawData[0] || {});
  
  columns.forEach(col => {
    const isNumeric = cleaned.some(row => typeof row[col] === 'number' && !isNaN(row[col]));
    
    if (isNumeric) {
      const validVals = cleaned.filter(r => !r._isDeleted).map(r => r[col]).filter(v => typeof v === 'number' && !isNaN(v));
      const mean = validVals.length > 0 ? validVals.reduce((a, b) => a + b, 0) / validVals.length : 0;
      const roundedMean = Math.round(mean);
      
      // Fill Nulls
      cleaned = cleaned.map(row => {
        if (!row._isDeleted && (row[col] === null || row[col] === undefined || row[col] === '')) {
          nullsFilled++;
          return { 
            ...row, 
            [col]: roundedMean,
            _isModified: true,
            _cleaningLogs: [...(row._cleaningLogs || []), `Filled null ${col} with mean (${roundedMean})`]
          };
        }
        return row;
      });

      // Outlier Detection (IQR Method) - Mark row for removal
      const values = cleaned.filter(r => !r._isDeleted).map(r => Number(r[col])).filter(v => !isNaN(v)).sort((a, b) => a - b);
      if (values.length > 4) {
        const q1 = values[Math.floor(values.length * 0.25)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        cleaned = cleaned.map(row => {
          if (!row._isDeleted) {
            const val = Number(row[col]);
            if (val < lowerBound || val > upperBound) {
              return {
                ...row,
                _isDeleted: true,
                _isOutlier: true,
                _cleaningLogs: [...(row._cleaningLogs || []), `Outlier detected in ${col} (${val}) - Row removed`]
              };
            }
          }
          return row;
        });
      }
    } else {
      // Categorical - Find Mode (Most Frequent)
      const counts: Record<string, number> = {};
      cleaned.filter(r => !r._isDeleted).forEach(row => {
        const val = row[col];
        if (val !== null && val !== undefined && val !== '') {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      
      let mode = 'Unknown';
      let maxCount = 0;
      Object.entries(counts).forEach(([val, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mode = val;
        }
      });

      cleaned = cleaned.map(row => {
        if (!row._isDeleted && (row[col] === null || row[col] === undefined || row[col] === '')) {
          nullsFilled++;
          return { 
            ...row, 
            [col]: mode,
            _isModified: true,
            _cleaningLogs: [...(row._cleaningLogs || []), `Filled null ${col} with mode (${mode})`]
          };
        }
        return row;
      });
    }
  });

  const totalRowsRemoved = cleaned.filter(r => r._isDeleted).length;
  const outliersCount = cleaned.filter(r => r._isOutlier).length;

  return { 
    cleaned, 
    stats: { 
      rowsRemoved: totalRowsRemoved, 
      nullsFilled, 
      outliersHandled: outliersCount 
    } 
  };
}
