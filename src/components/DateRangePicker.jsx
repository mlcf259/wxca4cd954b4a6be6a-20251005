// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Calendar, ChevronDown } from 'lucide-react';

export function DateRangePicker({
  value = 'month',
  onChange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [{
    value: 'week',
    label: '最近一周'
  }, {
    value: 'month',
    label: '最近一月'
  }, {
    value: 'quarter',
    label: '最近一季度'
  }, {
    value: 'year',
    label: '最近一年'
  }, {
    value: 'custom',
    label: '自定义'
  }];
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  return <div className="relative">
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