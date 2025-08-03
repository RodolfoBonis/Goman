import React from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  X,
  MoreHorizontal
} from 'lucide-react';
import { TabItem } from './TabItem';
import { Button } from './Button';
import { useTabsStore } from '@/store';
import { cn } from '@/utils';

interface TabsManagerProps {
  onNewRequest?: () => void;
  className?: string;
}

export const TabsManager: React.FC<TabsManagerProps> = ({
  onNewRequest,
  className,
}) => {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    duplicateTab,
    pinTab,
    closeOtherTabs,
    closeTabsToRight,
    closeAllTabs,
  } = useTabsStore();

  const [showScrollButtons, setShowScrollButtons] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const moreMenuRef = React.useRef<HTMLDivElement>(null);

  // Check scroll state
  const checkScrollState = React.useCallback(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    setShowScrollButtons(scrollWidth > clientWidth);
  }, []);

  // Handle scroll
  const scroll = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Close more menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreMenu]);

  // Monitor scroll state
  React.useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    checkScrollState();
    
    const resizeObserver = new ResizeObserver(checkScrollState);
    resizeObserver.observe(container);

    container.addEventListener('scroll', checkScrollState);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', checkScrollState);
    };
  }, [checkScrollState, tabs.length]);

  if (tabs.length === 0) {
    return (
      <div className={cn('flex items-center justify-center border-b border-gray-200 bg-gray-50 py-8', className)}>
        <div className="text-center">
          <p className="text-gray-500 mb-4">No tabs open</p>
          {onNewRequest && (
            <Button onClick={onNewRequest} variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center border-b border-gray-200 bg-gray-50', className)}>
      {/* Left scroll button */}
      {showScrollButtons && (
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={cn(
            'flex-shrink-0 p-1 border-r border-gray-200 hover:bg-gray-100 transition-colors',
            !canScrollLeft && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Tabs container */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onActivate={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
            onDuplicate={() => duplicateTab(tab.id)}
            onPin={() => pinTab(tab.id, !tab.pinned)}
            onCloseOthers={() => closeOtherTabs(tab.id)}
            onCloseToRight={() => closeTabsToRight(tab.id)}
            canCloseToRight={index < tabs.length - 1}
          />
        ))}
      </div>

      {/* Right scroll button */}
      {showScrollButtons && (
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={cn(
            'flex-shrink-0 p-1 border-l border-gray-200 hover:bg-gray-100 transition-colors',
            !canScrollRight && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* New tab button */}
      {onNewRequest && (
        <button
          onClick={onNewRequest}
          className="flex-shrink-0 p-2 border-l border-gray-200 hover:bg-gray-100 transition-colors"
          title="New Request"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}

      {/* More actions */}
      <div className="relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="flex-shrink-0 p-2 border-l border-gray-200 hover:bg-gray-100 transition-colors"
          title="More Actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {/* More menu */}
        {showMoreMenu && (
          <div
            ref={moreMenuRef}
            className="absolute right-0 top-full z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
          >
            <button
              onClick={() => {
                closeAllTabs();
                setShowMoreMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <X className="h-4 w-4" />
              Close All Tabs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};