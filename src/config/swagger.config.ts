import type { Application } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "projecTraK APIs",
      version: "1.0.0",
      description:
        "API documentation for projectTrak: Project Status Tracking System",
    },
    servers: [
      { url: "http://localhost:3000/api", description: "Main API server" },
    ],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Assignment", description: "Task assignment endpoints" },
      { name: "Company", description: "Company management endpoints" },
      { name: "Project", description: "Project management endpoints" },
      { name: "Employee", description: "Employee management endpoints" },
      { name: "Dashboard", description: "Dashboard analytics endpoints" },
      { name: "Subtask", description: "Subtask management endpoints" },
      { name: "Task", description: "Task management endpoints" },
      { name: "User", description: "User management endpoints" },
      { name: "PRM", description: "PRM file endpoints" },
      { name: "Version", description: "Version management endpoints" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // --- CREATE DTOs ---
        CreateEmployeeDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            company_id: { type: "string", format: "uuid" },
          },
          required: ["name", "email", "company_id"],
        },
        CreateAssignmentDto: {
          type: "object",
          properties: {
            user_id: { type: "string", format: "uuid" },
          },
          required: ["user_id"],
        },
        CreateProjectDto: {
          type: "object",
          properties: {
            company_id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            versions: {
              type: "array",
              items: { $ref: "#/components/schemas/CreateVersionDto" },
            },
            tasks: {
              type: "array",
              items: { $ref: "#/components/schemas/CreateTaskDto" },
            },
          },
          required: ["company_id", "name"],
        },
        CreatePrmDto: {
          type: "object",
          properties: {
            company_id: { type: "string", format: "uuid" },
          },
          required: ["company_id"],
        },
        CreateSubtaskDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            due_date: { type: "string", format: "date-time" },
            task_id: { type: "string" },
          },
          required: ["name", "task_id"],
        },
        CreateTaskDto: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string" },
            estimated_time: { type: "string" },
            due_date: { type: "string", format: "date-time" },
            description: { type: "string" },
            subtasks: {
              type: "array",
              items: { $ref: "#/components/schemas/CreateSubtaskDto" },
            },
          },
          required: ["title"],
        },
        CreateVersionDto: {
          type: "object",
          properties: {
            version: { type: "string" },
            status: { type: "string" },
            progress: { type: "number" },
            tasks: {
              type: "array",
              items: { type: "object" },
            },
          },
          required: ["version"],
        },

        // --- UPDATE DTOs ---
        UpdateEmployeeDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            company_id: { type: "string", format: "uuid" },
          },
        },
        UpdateCompanyDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            domain: { type: "string" },
          },
        },
        UpdateProjectDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
        },
        UpdateSubtaskDto: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            due_date: { type: "string", format: "date-time" },
          },
        },
        UpdateTaskDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            category: { type: "string" },
            status: { type: "string" },
            estimated_time: { type: "string" },
            due_date: { type: "string", format: "date-time" },
            description: { type: "string" },
            subtasks: {
              type: "array",
              items: { $ref: "#/components/schemas/CreateSubtaskDto" },
            },
          },
        },
        UpdateUserDto: {
          type: "object",
          properties: {
            username: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            roleId: { type: "integer" },
            passkey: { type: "string" },
          },
        },
        UpdateVersionDto: {
          type: "object",
          properties: {
            version: { type: "string" },
            status: { type: "string" },
            progress: { type: "number" },
          },
        },

        // --- RESPONSE DTOs ---
        AuthResponse: {
          type: "object",
          properties: {
            access_token: { type: "string" },
            user: { type: "object" },
          },
        },
        UserResponseDto: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            company_id: { type: "string", format: "uuid" },
          },
        },
        EmployeeResponseDto: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            user_id: { type: "string", format: "uuid" },
            company_id: { type: "string", format: "uuid" },
          },
        },
        CompanyResponseDto: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            domain: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        AssignmentResponseDto: {
          type: "object",
          properties: {
            task_id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            assigned_at: { type: "string", format: "date-time" },
          },
        },
        ProjectResponseDto: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            company_id: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        PrmResponseDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            file: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        DashboardOverviewDto: {
          type: "object",
          properties: {
            totalProjects: { type: "integer" },
            totalEmployees: { type: "integer" },
            totalTasks: { type: "integer" },
            completedTasks: { type: "integer" },
          },
        },
        EmployeeProgressDto: {
          type: "object",
          properties: {
            employeeId: { type: "string" },
            progress: { type: "number" },
          },
        },
        ProjectOverviewDto: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            status: { type: "string" },
            progress: { type: "number" },
          },
        },
        RecentProjectsDto: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
        ProjectVersionsDto: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              version: { type: "string" },
            },
          },
        },
        TaskDistributionDto: {
          type: "object",
          properties: {
            status: { type: "string" },
            count: { type: "integer" },
          },
        },
        EmployeeCountDto: {
          type: "object",
          properties: {
            count: { type: "integer" },
          },
        },
        TaskResponseDto: {
          type: "object",
          properties: {
            project_id: { type: "string" },
            project_name: { type: "string" },
            id: { type: "string" },
            title: { type: "string" },
            category: { type: "string" },
            priority: { type: "string" },
            status: { type: "string" },
            progress: { type: "number" },
            project_version_id: { type: "string" },
            project_version: { type: "object" },
            estimated_time: { type: "string" },
            remaining_time: { type: "string" },
            due_date: { type: "string" },
            description: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            subtasks: {
              type: "array",
              items: { $ref: "#/components/schemas/SubtaskResponseDto" },
            },
          },
        },
        VersionResponseDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            version: { type: "string" },
            status: { type: "string" },
            progress: { type: "number" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        SubtaskResponseDto: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            completed: { type: "boolean" },
            time_estimate: { type: "string" },
            task_id: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            assignments: {
              type: "array",
              items: { $ref: "#/components/schemas/AssignmentResponseDto" },
            },
          },
        },
        CategorizedTasksResponseDto: {
          type: "object",
          properties: {
            category: { type: "string" },
            tasks: {
              type: "array",
              items: { $ref: "#/components/schemas/TaskResponseDto" },
            },
          },
        },

        // --- OTHER DTOs ---
        RegisterDto: {
          type: "object",
          properties: {
            username: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            company_name: { type: "string" },
            company_domain: { type: "string" },
            company_passkey: { type: "string" },
            import_config: {
              $ref: "#/components/schemas/UpsertUserImportConfigDto",
            },
          },
          required: [
            "username",
            "email",
            "password",
            "company_name",
            "company_domain",
            "company_passkey",
          ],
        },
        UpsertUserImportConfigDto: {
          type: "object",
          properties: {
            users_endpoint: { type: "string", format: "uri" },
            users_name_key: { type: "string" },
            users_email_key: { type: "string" },
            users_headers_json: { type: "string" },
          },
          required: ["users_endpoint", "users_name_key", "users_email_key"],
        },
        LoginDto: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
          required: ["username", "password"],
        },
        EmployeeLoginDto: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            passkey: { type: "string" },
          },
          required: ["email", "passkey"],
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/controller/*.ts"],
};

export function setupSwagger(app: Application) {
  const spec = swaggerJsdoc(swaggerOptions);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spec, { explorer: true })
  );
}
