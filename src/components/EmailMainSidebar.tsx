
import React from 'react';
import EmailLabels from './EmailLabels';

interface EmailMainSidebarProps {
  isLabelsVisible: boolean;
  labels: Array<{ id: string; name: string; color: string; count: number }>;
  aiCategories: Array<{ name: string; count: number; color: string }>;
  onCreateLabel: (name: string, color: string) => void;
  onDeleteLabel: (labelId: string) => void;
  onEditLabel: (labelId: string, name: string, color: string) => void;
  onFilterByLabel: (labelName: string) => void;
  selectedLabel: string;
}

const EmailMainSidebar: React.FC<EmailMainSidebarProps> = ({
  isLabelsVisible,
  labels,
  aiCategories,
  onCreateLabel,
  onDeleteLabel,
  onEditLabel,
  onFilterByLabel,
  selectedLabel
}) => {
  if (!isLabelsVisible) return null;

  return (
    <div className="w-64 bg-white border-r border-gray-200 animate-slide-in-right">
      <EmailLabels
        labels={labels}
        onCreateLabel={onCreateLabel}
        onDeleteLabel={onDeleteLabel}
        onEditLabel={onEditLabel}
        onFilterByLabel={onFilterByLabel}
        selectedLabel={selectedLabel}
        aiCategories={aiCategories}
      />
    </div>
  );
};

export default EmailMainSidebar;
