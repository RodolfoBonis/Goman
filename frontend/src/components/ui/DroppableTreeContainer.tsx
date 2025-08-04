import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { cn } from '@/utils';

interface DroppableTreeContainerProps {
  droppableId: string;
  children: React.ReactNode;
  className?: string;
}

export const DroppableTreeContainer: React.FC<DroppableTreeContainerProps> = ({
  droppableId,
  children,
  className,
}) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            'min-h-[50px]',
            snapshot.isDraggingOver && 'bg-blue-50 border-2 border-blue-200 border-dashed',
            className
          )}
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}; 