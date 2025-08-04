import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { ChevronRight, ChevronDown, Folder, FileText, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils';
import type { CollectionTreeItem } from '@/types';

interface DraggableTreeItemProps {
  item: CollectionTreeItem;
  index: number;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onClick: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
  onDropdownToggle: (event: React.MouseEvent) => void;
  isDropdownOpen: boolean;
  children?: React.ReactNode;
}

export const DraggableTreeItem: React.FC<DraggableTreeItemProps> = ({
  item,
  index,
  level,
  isSelected,
  isExpanded,
  hasChildren,
  onToggle,
  onClick,
  onContextMenu,
  onDropdownToggle,
  isDropdownOpen,
  children,
}) => {
  const getIcon = () => {
    switch (item.type) {
      case 'collection':
        return <Folder className="h-4 w-4 text-blue-500" />;
      case 'folder':
        return <Folder className="h-4 w-4 text-gray-500" />;
      case 'request':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getExpandIcon = () => {
    if (!hasChildren) return null;
    
    return isExpanded ? (
      <ChevronDown className="h-4 w-4 text-gray-500" />
    ) : (
      <ChevronRight className="h-4 w-4 text-gray-500" />
    );
  };

  return (
    <Draggable draggableId={`${item.type}-${item.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'group relative',
            snapshot.isDragging && 'opacity-50'
          )}
        >
          <div
            className={cn(
              'flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer select-none',
              isSelected && 'bg-blue-50 text-blue-700',
              level > 0 && 'ml-4'
            )}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={onClick}
            onContextMenu={onContextMenu}
          >
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="p-1 hover:bg-gray-200 rounded mr-1"
              >
                {getExpandIcon()}
              </button>
            )}

            {/* Icon */}
            <div className="mr-2 flex-shrink-0">
              {getIcon()}
            </div>

            {/* Name */}
            <span className="flex-1 truncate">{item.name}</span>

            {/* Method badge for requests */}
            {item.type === 'request' && item.method && (
              <span className={cn(
                'ml-2 px-2 py-0.5 text-xs font-medium rounded',
                'bg-gray-100 text-gray-700'
              )}>
                {item.method}
              </span>
            )}

            {/* Dropdown Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDropdownToggle(e);
              }}
              className={cn(
                'p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                isDropdownOpen && 'opacity-100'
              )}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Children */}
          {children}
        </div>
      )}
    </Draggable>
  );
}; 