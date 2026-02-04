"use client";

import { parties } from "@/lib/data/parties";

export default function Legend() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="font-medium text-gray-900 mb-3">政党カラー凡例</h3>
      <div className="grid grid-cols-2 gap-2">
        {parties.map((party) => (
          <div key={party.id} className="flex items-center space-x-2">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: party.color }}
            />
            <span className="text-sm text-gray-700">{party.shortName}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">確信度</h4>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-xs text-gray-600">高</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-4 h-4 bg-red-300 rounded" />
            <span className="text-xs text-gray-600">中</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-4 h-4 bg-red-100 rounded" />
            <span className="text-xs text-gray-600">低</span>
          </div>
        </div>
      </div>
    </div>
  );
}
