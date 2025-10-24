import React, { useState, useEffect } from 'react';

interface CountryGridFilterProps {
  countries: string[];
  selectedCountry: string;
  onCountrySelect: (country: string) => void;
  initialItemsPerPage?: number;
}

const CountryGridFilter: React.FC<CountryGridFilterProps> = ({
  countries,
  selectedCountry,
  onCountrySelect,
  initialItemsPerPage = 12
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [paginatedCountries, setPaginatedCountries] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // 计算分页数据
  useEffect(() => {
    const total = Math.ceil(countries.length / itemsPerPage);
    setTotalPages(total);
    
    // 确保当前页不超出总页数
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
  }, [countries.length, itemsPerPage]);

  // 更新当前页显示的国家列表
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedCountries(countries.slice(startIndex, endIndex));
  }, [currentPage, countries, itemsPerPage]);

  // 处理页码点击
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // 滚动到筛选器顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 页码数组生成（显示当前页附近的页码）
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    // 如果页数较少，全部显示
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 显示首页
      pageNumbers.push(1);
      
      // 显示省略号
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      
      // 显示当前页附近的页码
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pageNumbers.push(i);
      }
      
      // 显示省略号
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      // 显示末页
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="w-full">
      {/* 国家网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {paginatedCountries.map(country => (
          <button
            key={country}
            onClick={() => onCountrySelect(country)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${selectedCountry === country ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            aria-pressed={selectedCountry === country}
          >
            {country === 'all' ? 'All' : country}
          </button>
        ))}
      </div>
      
      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2">
          {/* 页码指示器 */}
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          
          {/* 分页按钮 */}
          <div className="flex items-center space-x-1">
            {/* 上一页按钮 */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${currentPage === 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* 页码按钮 */}
            {getPageNumbers().map((page, index) => (
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="w-8 h-8 flex items-center justify-center text-gray-500">
                  {page}
                </span>
              )
            ))}
            
            {/* 下一页按钮 */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* 每页显示数量选择器 */}
          <div className="text-sm text-gray-400 flex items-center space-x-2">
            <span>Show:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-gray-800 text-gray-300 border border-gray-700 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryGridFilter;