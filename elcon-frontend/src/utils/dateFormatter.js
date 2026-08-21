/**
 * Global Date Formatter Utility
 */

export const formatDateTime = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';
  
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  
  const hh = String(hours).padStart(2, '0');
  
  return `${dd}-${mm}-${yyyy} ${hh}:${minutes}:${seconds} ${ampm}`;
};

export const formatDateOnly = (value) => {
  if (!value) return '---';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '---';
  
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  
  return `${dd}-${mm}-${yyyy}`;
};

// Also export formatDate for backward compatibility while migrating
export const formatDate = formatDateTime;
