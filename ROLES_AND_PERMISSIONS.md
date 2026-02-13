# Roles and Permissions Documentation

This document outlines the capabilities, access rights, and limitations for each user role in the application.

## Overview of Roles
The application defines five distinct roles:
1. **Admin**: Superuser with full system access.
2. **Team Lead**: Department-level manager with broad permissions within their scope.
3. **Account Manager**: Client-facing role with specific task creation and review capabilities.
4. **User**: Standard employee role focused on task execution.
5. **HR**: Specialized role for human resources (restricted).

---

## 1. Admin
**Scope:** Global System Access

### Capabilties:
- **Projects:**
  - View all projects across all departments.
  - Create, Edit, Archive, and Delete projects.
  - Manage project stages (Add, Edit, Delete, Reorder).
  - Assign Project Groups.
- **Tasks:**
  - View all tasks.
  - Create, Edit, and Delete any task.
  - Move tasks between stages (Drag & Drop).
  - Review tasks in "Review" stages (Approve or Request Revision).
  - View Task History and Revision History.
- **Team Management:**
  - Access the "Team" page (manage users).
  - Access the "Tasks" page (global task list).
- **Navigation:**
  - User Dashboard.
  - Full access to Sidebar menus (Dashboard, Team, Tasks).

### Limitations:
- None.

---

## 2. Team Lead
**Scope:** Departmental Level

### Capabilities:
- **Projects:**
  - View and manage projects within their **assigned department**.
  - *Special Case:* "Digital" department leads can also view "Design" department projects.
  - Create, Edit, and Archive projects within their scope.
  - Manage project stages.
- **Tasks:**
  - Create, Edit, and Delete tasks in their projects.
  - Move tasks between stages.
  - Review tasks (Approve/Request Revision).
  - Auto-start tasks (Time tracking).
- **Team Management:**
  - Access "Team" page.
  - Access "Tasks" page.

### Limitations:
- Cannot manage projects or tasks outside their department (and the "Digital" -> "Design" exception).

---

## 3. Account Manager
**Scope:** Client/Department Focused

### Capabilities:
- **Projects:**
  - View projects within their **assigned department** only.
  - **Create Tasks**: Can create new tasks in projects.
  - **Edit Tasks**: Can edit task details.
  - View "Review Needed" count in sidebar.
- **Task Review:**
  - Access to dedicated **Review Needed** page.
  - Can Review (Approve/Request Revision) tasks **only if assigned to them**.
- **Navigation:**
  - User Dashboard.
  - Access to "Review Needed" page.
  - Access to "Tasks" lists (Filtered).

### Limitations:
- **Cannot Delete Tasks.**
- **Cannot Drag & Drop** tasks on the main project board (readonly board view).
- **Cannot Manage Project Stages** (Add/Edit/Delete project stages).
- Cannot access "Team" page.

---

## 4. User
**Scope:** Personal Task Execution

### Capabilities:
- **Projects:**
  - **Cannot view main Project Board**. Redirected to a personalized **My Tasks** view for the project.
  - View projects only where they have active assignments or are added as a collaborator.
- **Tasks:**
  - **View**: See only tasks assigned to them.
  - **Workflow**: Can drag tasks through their own **Personal Stage Workflow** (e.g., Pending -> In Progress -> Complete).
  - **Completion**: Can mark tasks as complete (requires comment/attachments).
  - **Personal Customization**: Can create custom personal stages (e.g., "Designing", "Researching") between "Pending" and "Complete" to track their own work.
- **Navigation:**
  - User Dashboard.
  - Access to "Tasks" lists (Client-side filtered to own tasks).

### Limitations:
- **Cannot Create Tasks.**
- **Cannot Edit Task Details** (Title, Description, Due Date, etc.).
- **Cannot Delete Tasks.**
- Cannot view unassigned tasks or tasks assigned to others.
- Cannot manage Project Stages.

---

## 5. HR
**Scope:** HR Dashboard Only

### Capabilities:
- Access to **HR Dashboard**.

### Limitations:
- **Severely Restricted**:
  - No access to Projects.
  - No access to Tasks.
  - No access to Team management.
  - Cannot interact with the main workflow of the application.

---

## Permission Matrix

| Feature | Admin | Team Lead | Account Manager | User | HR |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View All Projects** | ✅ | ⚠️ (Dept Only) | ⚠️ (Dept Only) | ❌ | ❌ |
| **View Team Page** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create Project** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Manage Stages** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Project Board**| ✅ | ✅ | ✅ (Read Only) | ❌ (Redirected) | ❌ |
| **Create Task** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Edit Task Details** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Delete Task** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Drag Task (Project)**| ✅ | ✅ | ❌ | ❌ | ❌ |
| **Review Task** | ✅ | ✅ | ⚠️ (If Assigned) | ❌ | ❌ |
| **My Tasks Workflow** | N/A | N/A | N/A | ✅ | ❌ |
