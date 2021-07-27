export interface SidebarContext {
    open: boolean;
    type: 'chat' | 'attachments' | null;
    toggleSidebar: (state: boolean, type: 'chat' | 'attachments' | null) => void;
}