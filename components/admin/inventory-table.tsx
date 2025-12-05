'use client';

import { useState } from 'react';
import { triggerInventoryAnalysis } from '@/app/actions/inventory-actions';
import toast from 'react-hot-toast';
import type { Ingredient } from '@prisma/client';

interface InventoryTableProps {
  ingredients: Ingredient[];
}

// Helper function to format dates consistently (prevents hydration mismatch)
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export function InventoryTable({ ingredients }: InventoryTableProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await triggerInventoryAnalysis();
      toast.success(`Analysis complete! Created ${result.alertsCreated} alerts.`);
    } catch {
      toast.error('Failed to analyze inventory');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.quantity <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (ingredient.quantity < ingredient.threshold) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const getExpiryStatus = (ingredient: Ingredient) => {
    if (!ingredient.expiryDate) return null;
    const daysUntilExpiry = Math.ceil(
      (new Date(ingredient.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'bg-red-100 text-red-800' };
    if (daysUntilExpiry <= 3) return { label: 'Expiring Soon', color: 'bg-orange-100 text-orange-800' };
    if (daysUntilExpiry <= 7) return { label: 'Expires This Week', color: 'bg-yellow-100 text-yellow-800' };
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold">Ingredients</h2>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-white font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          {isAnalyzing ? 'Analyzing...' : '🔍 AI Analysis'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Threshold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ingredients.map((ingredient) => {
              const stockStatus = getStockStatus(ingredient);
              const expiryStatus = getExpiryStatus(ingredient);

              return (
                <tr key={ingredient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {Number(ingredient.quantity).toFixed(2)} {ingredient.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {Number(ingredient.threshold).toFixed(2)} {ingredient.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ingredient.expiryDate
                        ? formatDate(ingredient.expiryDate)
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                      {expiryStatus && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${expiryStatus.color}`}>
                          {expiryStatus.label}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

