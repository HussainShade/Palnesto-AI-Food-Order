'use client';

import { useState } from 'react';
import { markAlertAsRead } from '@/app/actions/inventory-actions';
import toast from 'react-hot-toast';
import { X, AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react';
import type { AIAlert, Ingredient } from '@prisma/client';

// Helper function to format dates consistently (prevents hydration mismatch)
const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

interface AlertPanelProps {
  alerts: Array<AIAlert & { ingredient: Ingredient | null }>;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'CRITICAL':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case 'HIGH':
      return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    case 'MEDIUM':
      return <Info className="w-5 h-5 text-yellow-600" />;
    default:
      return <Zap className="w-5 h-5 text-blue-600" />;
  }
};

const getAlertColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-50 border-red-200';
    case 'HIGH':
      return 'bg-orange-50 border-orange-200';
    case 'MEDIUM':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

export function AlertPanel({ alerts: initialAlerts }: AlertPanelProps) {
  const [alerts, setAlerts] = useState(initialAlerts);

  const handleDismiss = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(alerts.filter((a) => a.id !== alertId));
      toast.success('Alert dismissed');
    } catch {
      toast.error('Failed to dismiss alert');
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      <h2 className="text-xl font-bold text-gray-900">AI Alerts</h2>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${getAlertColor(alert.severity)} border rounded-xl p-4 flex items-start gap-3`}
        >
          <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.severity)}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                <p className="text-sm text-gray-700">{alert.message}</p>
                {alert.ingredient && (
                  <p className="text-xs text-gray-500 mt-1">
                    Ingredient: {alert.ingredient.name}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {formatDateTime(alert.createdAt)}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="p-1 hover:bg-white/50 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

