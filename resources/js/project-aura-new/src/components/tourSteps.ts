import { TourStep } from './OnboardingTour';

// Tour steps for USER role - comprehensive introduction to all features
export const userTourSteps: TourStep[] = [
    // Welcome step
    {
        target: '[data-tour="dashboard-header"]',
        title: '👋 Welcome to Aura!',
        content: 'This is your personal dashboard where you can see all your tasks at a glance. Let us show you around and introduce you to the key features!',
        placement: 'bottom',
        spotlightPadding: 16
    },
    // Sidebar navigation
    {
        target: '[data-tour="sidebar"]',
        title: '📌 Navigation Sidebar',
        content: 'The sidebar is your main navigation hub. Here you can access your dashboard, browse projects, and navigate to different sections of the app.',
        placement: 'right',
        spotlightPadding: 12
    },
    // Dashboard stats
    {
        target: '[data-tour="dashboard-stats"]',
        title: '📊 Task Statistics',
        content: 'These cards show your task overview: total tasks assigned to you, in-progress tasks, completed tasks, and overdue items. Keep an eye on these to stay on track!',
        placement: 'bottom',
        spotlightPadding: 12
    },
    // Task calendar
    {
        target: '[data-tour="task-calendar"]',
        title: '📅 Task Calendar',
        content: 'Your task calendar shows all your tasks organized by due date. Click on any task to view details, or drag tasks to reschedule them. Tasks are color-coded by priority.',
        placement: 'top',
        spotlightPadding: 12
    },
    // Projects in sidebar
    {
        target: '[data-tour="projects-list"]',
        title: '📁 Your Projects',
        content: 'Here you\'ll find all projects you\'re assigned to. Click on a project to see its Kanban board with tasks organized by stages. Projects are grouped by department.',
        placement: 'right',
        spotlightPadding: 12
    },
    // Notifications
    {
        target: '[data-tour="notifications"]',
        title: '🔔 Notifications',
        content: 'Never miss an update! Click the bell icon to see your notifications. You\'ll be notified when tasks are assigned to you, when there are comments, or when deadlines approach.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    // Global search
    {
        target: '[data-tour="global-search"]',
        title: '🔍 Quick Search',
        content: 'Press Ctrl+K (or Cmd+K on Mac) to open the global search. You can quickly find tasks, projects, or team members from anywhere in the app.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    // Theme toggle
    {
        target: '[data-tour="theme-toggle"]',
        title: '🎨 Theme Toggle',
        content: 'Prefer dark mode? Click here to switch between light and dark themes. Your preference will be saved automatically.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    // User menu
    {
        target: '[data-tour="user-menu"]',
        title: '👤 Your Account',
        content: 'Click here to access your profile settings and log out. You can also start this tour again anytime from here.',
        placement: 'left',
        spotlightPadding: 8
    },
    // Final step
    {
        target: '[data-tour="dashboard-header"]',
        title: '🎉 You\'re All Set!',
        content: 'That\'s the basics! Feel free to explore and reach out if you need help. You can restart this tour anytime from the user menu. Happy tasking!',
        placement: 'bottom',
        spotlightPadding: 16
    }
];

// Tour steps for detailed task interaction (shown when user opens first task)
export const taskDetailsTourSteps: TourStep[] = [
    {
        target: '[data-tour="task-title"]',
        title: '📝 Task Title & Priority',
        content: 'Each task has a title and priority indicator. High priority tasks are marked in red, medium in yellow, and low in green.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    {
        target: '[data-tour="task-status"]',
        title: '📊 Task Status',
        content: 'Track your progress by updating the task status. Move it through stages like "In Progress", "Review", and "Completed".',
        placement: 'bottom',
        spotlightPadding: 8
    },
    {
        target: '[data-tour="task-due-date"]',
        title: '📅 Due Date',
        content: 'Keep track of deadlines. Tasks approaching their due date will appear in your calendar and send you reminders.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    {
        target: '[data-tour="task-attachments"]',
        title: '📎 Attachments',
        content: 'Add files, images, or documents related to your task. All team members can access these attachments.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    {
        target: '[data-tour="task-comments"]',
        title: '💬 Comments',
        content: 'Collaborate with your team by leaving comments. You\'ll receive notifications when someone replies.',
        placement: 'top',
        spotlightPadding: 8
    }
];

// Quick tips that can be shown as floating tooltips
export const quickTips = [
    {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        content: 'Press Ctrl+K to search, Esc to close dialogs, and Enter to confirm actions.'
    },
    {
        id: 'drag-drop',
        title: 'Drag & Drop',
        content: 'You can drag tasks between columns on the Kanban board to update their status.'
    },
    {
        id: 'quick-actions',
        title: 'Quick Actions',
        content: 'Right-click on a task to see quick action options like edit, delete, or mark complete.'
    },
    {
        id: 'calendar-navigation',
        title: 'Calendar Navigation',
        content: 'Use the arrow buttons to navigate between months, or click "Today" to jump back.'
    }
];
