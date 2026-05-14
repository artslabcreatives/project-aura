# Aura Project Management System: Role-Based Visibility & Functionality

This document outlines the sidebar menu structure and project/task visibility rules for each user role in the Aura application. This is intended for use in mobile application development to ensure consistency with the web platform.

## User Roles

The system uses the following roles to manage access and permissions:
1.  **Admin**: Full system access and administrative controls.
2.  **Team Lead**: Department-level oversight and task management.
3.  **Account Manager (AM)**: Client and project coordination within a department.
4.  **User (Staff)**: Primary production role, focused on assigned tasks.
5.  **HR (Human Resources)**: Specialized access for leave, attendance, and client/invoice monitoring.

---

## 1. Sidebar Navigation (UI)

| Menu Item | Icon | Allowed Roles |
| :--- | :--- | :--- |
| **Dashboard** | LayoutDashboard | All Roles |
| **Chat** | MessageSquare | All Roles |
| **Team** | Users | All Roles (Internal filtering applies) |
| **Tasks** | CheckSquare | `admin`, `team-lead` |
| **Task Efficiency** | TrendingUp | All Roles |
| **Dept Efficiency** | BarChart3 | All Roles |
| **Reminders** | Bell | All Roles |
| **Clients** | Building2 | `admin`, `hr` |
| **Estimates** | FileText | `admin`, `team-lead`, `account-manager`, `hr` |
| **Emails** | Mail | All Roles |
| **Reports** | ClipboardList | All Roles |
| **Documents** | FileText | All Roles |
| **SSO Applications** | Shield | `admin` |

---

## 2. Project & Task Visibility Rules

Visibility is governed by the user's **Role** and **Department**.

### A. Admin
*   **Projects**: Full access to all projects across all departments.
*   **Tasks**: Full access to all tasks.
*   **Functionality**: Can manage users, configuration, and SSO settings.

### B. Team Lead
*   **Standard Rule**: Can see all projects and tasks belonging to their own department.
*   **Special Case: Design (Dept 9)**:
    *   **Projects**: Can see all projects in **Design (9)** AND **Digital Marketing (8)**.
    *   **Tasks**: Can see tasks in Design or Digital Marketing projects **ONLY IF** at least one member of the Design team is assigned to that task.
*   **Special Case: Digital Marketing (Dept 8)**:
    *   **Projects**: Can see all projects in **Digital Marketing (8)** AND **Design (9)** (Bidirectional visibility).

### C. Account Manager (AM)
*   **Standard Rule**: Can see all projects and tasks belonging to their own department.
*   **Special Case: Design (Dept 9)**:
    *   **Projects**: Restricted to projects where they are explicitly assigned a task or listed as a collaborator.
    *   **Tasks**: Restricted to tasks explicitly assigned to them (either as primary assignee or in the `assignedUsers` list).
*   **Visibility Note**: AMs in non-design departments function like Team Leads regarding department-wide visibility.

### D. User (Staff)
*   **Standard Rule**: Can see all projects and tasks in their own department.
*   **Special Case: Design (Dept 9)**:
    *   **Projects**: Restricted to projects where they have assigned tasks or are collaborators.
    *   **Tasks**: Only sees tasks explicitly assigned to them.

### E. HR (Human Resources)
*   **Projects**: Has administrative view of all projects (usually for monitoring/reports).
*   **Clients**: Can manage client information and invoices.
*   **Focus**: Primarily uses the HR Dashboard for leave management and attendance.

---

## 3. Key Logic for Mobile Implementation

### Bidirectional Collaboration (Design & Digital Marketing)
When implementing filters for **Design (Dept 9)** or **Digital Marketing (Dept 8)**:
1.  **Frontend Sidebar**: Ensure the sidebar fetches projects from both departments for these users.
2.  **Authorization**: The backend `ProjectController` and `TaskController` have special exceptions for these two departments to "work as one" while maintaining UI separation.

### Task Assignees
Tasks support multiple assignees. When checking if a task is "mine" or "belongs to my team," always check both:
*   `assignee_id` (Primary)
*   `task_assignees` table / `assignedUsers` relationship (Secondary/Multiple)

### Status-Based UI
*   **Archived Projects**: Should be read-only in the UI.
*   **On-Hold Projects**: Usually hidden from the active sidebar grouping but accessible via the "All Projects" view.

---
**Note**: The "AI Scenarios" and floating chatbot features have been hidden from the UI for all roles as of the latest update.
