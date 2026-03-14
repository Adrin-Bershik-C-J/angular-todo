# Angular Todo App

A role-based task management web application built with **Angular 20**. It supports four user roles — **Admin**, **Manager**, **Team Lead**, and **Member** — each with a dedicated dashboard and tailored set of permissions. Users can manage projects, create and assign todos, break work into subtasks, and visualise progress through interactive charts.

## Features

- 🔐 **Authentication** — JWT-based login and registration with route guards
- 👥 **Role-based dashboards** — separate views for Admin, Manager, Team Lead, and Member
- 📁 **Project management** — create and organise projects
- ✅ **Todo & subtask tracking** — create todos, break them into subtasks, and update statuses
- 📊 **Charts** — progress visualisations powered by Chart.js
- 🐳 **Docker support** — ready-to-use `Dockerfile` for containerised deployment
- 🚀 **Netlify deployment** — `netlify.toml` included for one-click cloud hosting

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 20 |
| Language | TypeScript 5.8 |
| Styling | Bootstrap 5 |
| Charts | Chart.js 4 |
| Auth | JWT (via HTTP interceptor) |
| Containerisation | Docker |
| Hosting | Netlify |

## Roles

| Role | Key Capabilities |
|---|---|
| **Admin** | Full system access, user management |
| **Manager** | Create and oversee projects, assign team leads |
| **Team Lead** | Manage todos and subtasks for their team |
| **Member** | View and update their assigned todos |

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
