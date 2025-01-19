import React, { useState } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface CopyButtonProps {
  content: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-md hover:bg-gray-100 transition-colors"
      title="Copy as markdown"
    >
      {copied ? (
        <CheckIcon className="h-5 w-5 text-green-600" />
      ) : (
        <ClipboardDocumentIcon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
};