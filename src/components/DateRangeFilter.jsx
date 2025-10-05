// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Calendar, ChevronDown } from 'lucide-react';

export function DateRangeFilter({
  value,
  onChange,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [{
    value: 'today',
    label: '今天'
  }, {
    value: 'yesterday',
    label: '昨天'
  }, {
    value: 'thisWeek',
    label: '本周'
  }, {
    value: 'lastWeek',
    label: '上周'
  }, {
    value: 'thisMonth',
    label: '本月'
  }, {
    value: 'lastMonth',
    label: '上月'
  }, {
    value: 'thisQuarter',
    label: '本季度'
  }, {
    value: 'lastQuarter',
    label: '上季度'
  }, {
    value: 'thisYear',
    label: '今年'
  }, {
    value: 'lastYear',
    label: '去年'
  }, {
    value: 'custom',
    label: '自定义'
  }];
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  return <div className={`relative ${className}`}>
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
        <Calendar className="w-4 h-4" />
        <span>{selectedOption.label}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {options.map(option => <button key={option.value} onClick={() => {
        onChange(option.value);
        setIsOpen(false);
      }} className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg">
                {option.label}
              </button>)}
        </div>}
    </div>;
}