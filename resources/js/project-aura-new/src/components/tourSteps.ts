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

// Tour steps for TEAM LEAD role - Focus on management and oversight
export const teamLeadTourSteps: TourStep[] = [
    // Welcome step - Team Lead context
    {
        target: '[data-tour="dashboard-header"]',
        title: '👋 Welcome back, Team Lead!',
        content: 'This is your command center. As a Team Lead, you have powerful tools to manage your department\'s projects, tasks, and team members. Let\'s explore!',
        placement: 'bottom',
        spotlightPadding: 16
    },
    // Dashboard stats - Department overview
    {
        target: '[data-tour="dashboard-stats"]',
        title: '📊 Department Overview',
        content: 'Get a high-level view of your department\'s performance. See total active tasks, project progress, and critical items that need attention.',
        placement: 'bottom',
        spotlightPadding: 12
    },
    // Tasks Overview Cards (Timeline)
    {
        target: '[data-tour="team-tasks-overview"]',
        title: '📅 Task Timeline',
        content: 'Quickly identify what\'s due today, tomorrow, or overdue across your team. These cards help you prioritize and ensure deadlines are met.',
        placement: 'top',
        spotlightPadding: 12
    },
    // Team Management Navigation
    {
        target: '[data-tour="nav-team"]',
        title: '👥 Team Management',
        content: 'Head here to view your team members, check their workload, and manage permissions. Keeping your team organized starts here.',
        placement: 'right',
        spotlightPadding: 8
    },
    // Global Tasks Navigation
    {
        target: '[data-tour="nav-tasks"]',
        title: '✅ All Tasks',
        content: 'Access the master list of all tasks in your department. You can filter, sort, and manage tasks across all projects from this central view.',
        placement: 'right',
        spotlightPadding: 8
    },
    // Create Project Button
    {
        target: '[data-tour="create-project-btn"]',
        title: '🚀 Launch New Projects',
        content: 'Ready to start something new? Click this button to create a new project, define its workflow stages, and assign it to your team.',
        placement: 'right',
        spotlightPadding: 8
    },
    // Global Search
    {
        target: '[data-tour="global-search"]',
        title: '🔍 Power Search',
        content: 'Find anything instantly. Search for specific tasks, project codes, or team members. Pro tip: Use Ctrl+K for quick access.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    // Notifications
    {
        target: '[data-tour="notifications"]',
        title: '🔔 Important Updates',
        content: 'Stay informed about project updates, team activities, and urgent alerts. Check here to ensure nothing slips through the cracks.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    // User Menu
    {
        target: '[data-tour="user-menu"]',
        title: '⚙️ Settings & Profile',
        content: 'Manage your personal preferences, account settings, and access system configurations from here.',
        placement: 'left',
        spotlightPadding: 8
    },
    // Final step
    {
        target: '[data-tour="dashboard-header"]',
        title: '🎉 Ready to Lead!',
        content: 'You\'re equipped with the tools to lead your team to success. Explore the features and setup your projects. We\'re here to support you along the way!',
        placement: 'bottom',
        spotlightPadding: 16
    }
];

// Tour steps for ADMIN role - comprehensive system overview
export const adminTourSteps: TourStep[] = [
    // Welcome step - Admin context
    {
        target: '[data-tour="dashboard-header"]',
        title: '👋 Welcome back, Admin!',
        content: 'This is the central nervous system of Aura. You have full visibility and control over the entire organization. Let\'s review your command tools.',
        placement: 'bottom',
        spotlightPadding: 16
    },
    // Dashboard stats - Organization overview
    {
        target: '[data-tour="dashboard-stats"]',
        title: '📊 Organization Overview',
        content: 'These high-level metrics show the pulse of the entire company, including all active projects, department workloads, and system-wide task statuses.',
        placement: 'bottom',
        spotlightPadding: 12
    },
    // Tasks Overview Cards (Timeline)
    {
        target: '[data-tour="admin-tasks-overview"]',
        title: '📅 Global Task Timeline',
        content: 'Monitor deadlines across the entire organization. Spot bottlenecks and ensure all departments are delivering on time from this consolidated timeline.',
        placement: 'top',
        spotlightPadding: 12
    },
    // All Projects Navigation
    {
        target: '[data-tour="projects-list"]', // Reusing the projects list tour target
        title: '📁 All Projects',
        content: 'Access every project in the system, regardless of department. You can edit, archive, or audit any project from here.',
        placement: 'right',
        spotlightPadding: 12
    },
    // Manage Team
    {
        target: '[data-tour="nav-team"]',
        title: '👥 Organization Management',
        content: 'Here you can add new users, manage roles, and structure departments. This is where you build and maintain your organization\'s workforce.',
        placement: 'right',
        spotlightPadding: 8
    },
    // Global Tasks Analysis
    {
        target: '[data-tour="nav-tasks"]',
        title: '✅ Global Task Audit',
        content: 'Deep dive into any task in the system. Use powerful filters to generate reports or audit activity across any timeframe or team.',
        placement: 'right',
        spotlightPadding: 8
    },
    // Create Project Button
    {
        target: '[data-tour="create-project-btn"]',
        title: '🚀 Initialize Projects',
        content: 'Spin up new initiatives quickly. As an admin, you can create projects for any department and configure their workflows.',
        placement: 'right',
        spotlightPadding: 8
    },
    // Configuration / Settings (if available in sidebar or menu)
    // Assuming Configuration is in user menu or sidebar, but for now we'll stick to common elements

    // Global Search
    {
        target: '[data-tour="global-search"]',
        title: '🔍 Master Search',
        content: 'Locate any entity in the database instantly. Tasks, projects, users - if it exists, you can find it here with Ctrl+K.',
        placement: 'bottom',
        spotlightPadding: 8
    },
    // User Menu
    {
        target: '[data-tour="user-menu"]',
        title: '⚙️ System Admin',
        content: 'Access advanced system configurations, integrations, and your personal profile from this menu.',
        placement: 'left',
        spotlightPadding: 8
    },
    // Final step
    {
        target: '[data-tour="dashboard-header"]',
        title: '🎉 You have the Control!',
        content: 'You are all set to manage the platform. Remember, great power comes with great responsibility. We\'re here to help if you need us!',
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
