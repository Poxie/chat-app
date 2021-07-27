export interface SidebarContext {
    open: boolean;
    type: 'chat' | null;
    toggleSidebar: (state: boolean, type: 'chat' | null) => void;
}