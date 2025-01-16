export const mockPaginatedData = {
  companies: Array.from({ length: 100 }, (_, i) => ({
    id: `company-${i + 1}`,
    name: `テスト企業${i + 1}`,
    industry: i % 2 === 0 ? 'IT' : 'SaaS',
    created_at: new Date().toISOString()
  })),
  
  tasks: Array.from({ length: 50 }, (_, i) => ({
    id: `task-${i + 1}`,
    name: `タスク${i + 1}`,
    status: i % 3 === 0 ? 'completed' : 'pending',
    created_at: new Date().toISOString()
  }))
};

export const getPaginatedData = (
  dataType: 'companies' | 'tasks',
  page: number,
  pageSize: number
) => {
  const data = mockPaginatedData[dataType];
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: data.slice(start, end),
    total: data.length,
    hasMore: end < data.length
  };
}; 