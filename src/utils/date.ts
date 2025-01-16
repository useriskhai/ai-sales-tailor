import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'yyyy/MM/dd', { locale: ja });
}; 