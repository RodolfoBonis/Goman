import React from 'react';
import { 
  X, 
  FileText, 
  FolderOpen, 
  Pin, 
  Circle,
  MoreHorizontal,
  Copy,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn, getMethodColor } from '@/utils';
import type { Tab, RequestTab, CollectionTab } from '@/types';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onDuplicate: () => void;
  onPin: () => void;
  onCloseOthers: () => void;
  onCloseToRight: () => void;
  canCloseToRight: boolean;
}

export const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onActivate,
  onClose,
  onDuplicate,
  onPin,
  onCloseOthers,
  onCloseToRight,
  canCloseToRight,
}) => {
  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 });
  const contextMenuRef = React.useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    setShowContextMenu(false);
  };

  const getTabIcon = () => {
    if (tab.type === 'request') {
      const requestTab = tab as RequestTab;
      const method = requestTab.request.method;
      return (
        <div className={cn(
          'w-2 h-2 rounded-full',
          getMethodColor(method).replace('text-', 'bg-')
        )} />
      );
    } else {
      return <FolderOpen className="h-3 w-3 text-blue-500" />;
    }
  };

  const getTabTitle = () => {
    if (tab.type === 'request') {
      const requestTab = tab as RequestTab;
      return requestTab.request.name || 'Untitled Request';
    } else {
      const collectionTab = tab as CollectionTab;
      return collectionTab.collection.name;
    }
  };

  return (
    <>
      <div
        className={cn(
          'group relative flex items-center gap-2 px-3 py-2 min-w-0 max-w-[200px]',
          'border-r border-gray-200 cursor-pointer transition-colors',
          'hover:bg-gray-50',
          isActive 
            ? 'bg-white border-b-2 border-b-primary-500 text-primary-600'
            : 'bg-gray-50 text-gray-600',
          tab.pinned && 'bg-blue-50'
        )}
        onClick={onActivate}
        onContextMenu={handleContextMenu}
      >
        {/* Pin indicator */}
        {tab.pinned && (
          <Pin className="h-3 w-3 text-blue-500 flex-shrink-0" />
        )}

        {/* Tab icon */}
        <div className="flex-shrink-0">
          {getTabIcon()}
        </div>

        {/* Tab title */}
        <span className="truncate text-sm font-medium min-w-0 flex-1">
          {getTabTitle()}
        </span>

        {/* Unsaved changes indicator */}
        {tab.unsavedChanges && (
          <Circle className="h-2 w-2 text-orange-500 fill-current flex-shrink-0" />
        )}

        {/* Loading indicator for request tabs */}
        {tab.type === 'request' && (tab as RequestTab).isExecuting && (
          <div className="animate-spin w-3 h-3 border border-primary-500 border-t-transparent rounded-full flex-shrink-0" />
        )}

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={cn(
            'flex-shrink-0 p-0.5 rounded hover:bg-gray-200 transition-colors',
            'opacity-0 group-hover:opacity-100',
            isActive && 'opacity-100'
          )}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
        >
          <button
            onClick={() => handleMenuAction(onDuplicate)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Duplicate Tab
          </button>
          
          <button
            onClick={() => handleMenuAction(onPin)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Pin className="h-4 w-4" />
            {tab.pinned ? 'Unpin Tab' : 'Pin Tab'}
          </button>

          <hr className="my-1 border-gray-200" />
          
          <button
            onClick={() => handleMenuAction(onCloseOthers)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Close Others
          </button>
          
          {canCloseToRight && (
            <button
              onClick={() => handleMenuAction(onCloseToRight)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              Close to Right
            </button>
          )}
          
          <hr className="my-1 border-gray-200" />
          
          <button
            onClick={() => handleMenuAction(onClose)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Close Tab
          </button>
        </div>
      )}
    </>
  );
};