import type { Ledger, User } from '../types';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export const handleSort = (
  currentField: string,
  currentDirection: 'asc' | 'desc',
  newField: string
): SortConfig => {
  if (currentField === newField) {
    return {
      field: newField,
      direction: currentDirection === 'asc' ? 'desc' : 'asc'
    };
  } else {
    return {
      field: newField,
      direction: 'asc'
    };
  }
};

export const filterAndSortLedgers = (
  ledgers: Ledger[],
  filter: string,
  sortField: string,
  sortDirection: 'asc' | 'desc'
): Ledger[] => {
  return ledgers
    .filter(ledger => 
      ledger.id.toString().includes(filter) ||
      ledger.user?.username.toLowerCase().includes(filter.toLowerCase()) ||
      ledger.description.toLowerCase().includes(filter.toLowerCase()) ||
      ledger.status.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: any = a[sortField as keyof typeof a];
      let bVal: any = b[sortField as keyof typeof b];
      
      if (sortField === 'user') {
        aVal = a.user?.username || '';
        bVal = b.user?.username || '';
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
};

export const filterAndSortUsers = (
  users: User[],
  filter: string,
  sortField: string,
  sortDirection: 'asc' | 'desc'
): User[] => {
  return users
    .filter(user => 
      user.id.toString().includes(filter) ||
      user.username.toLowerCase().includes(filter.toLowerCase()) ||
      (user.email?.toLowerCase().includes(filter.toLowerCase()) || false) ||
      user.role.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: any = a[sortField as keyof typeof a];
      let bVal: any = b[sortField as keyof typeof b];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
};

export const downloadFile = async (blob: Blob, fileName: string): Promise<void> => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const getSortIcon = (currentField: string, targetField: string, direction: 'asc' | 'desc'): string => {
  if (currentField === targetField) {
    return direction === 'asc' ? ' ↑' : ' ↓';
  }
  return '';
};