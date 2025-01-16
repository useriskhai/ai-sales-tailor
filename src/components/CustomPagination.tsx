import React from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  totalItems?: number;
}

export const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const rangeWithDots: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        rangeWithDots.push(i);
      }
      return rangeWithDots;
    }

    // 常に最初のページを表示
    rangeWithDots.push(1);

    if (currentPage > 3) {
      rangeWithDots.push('...');
    }

    // 現在のページの前後のページを表示
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      rangeWithDots.push(i);
    }

    if (currentPage < totalPages - 2) {
      rangeWithDots.push('...');
    }

    // 常に最後のページを表示
    if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-2 py-4"
    >
      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span>表示件数:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring hover:bg-accent transition-colors"
          >
            {[10, 20, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}件
              </option>
            ))}
          </select>
        </div>
        {totalItems !== undefined && (
          <span className="text-muted-foreground">
            {totalItems === 0 ? (
              '該当するデータがありません'
            ) : (
              `${totalItems}件中 ${Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-${Math.min(currentPage * itemsPerPage, totalItems)}件を表示`
            )}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
          aria-label="最初のページへ"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
          aria-label="前のページへ"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <AnimatePresence mode="wait">
          <div className="flex items-center">
            {getPageNumbers().map((pageNumber, index) => (
              <React.Fragment key={index}>
                {pageNumber === '...' ? (
                  <span className="px-2 text-muted-foreground">...</span>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      variant={currentPage === pageNumber ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => onPageChange(Number(pageNumber))}
                      className={`h-8 w-8 ${
                        currentPage === pageNumber
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-accent/50'
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
          aria-label="次のページへ"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
          aria-label="最後のページへ"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};