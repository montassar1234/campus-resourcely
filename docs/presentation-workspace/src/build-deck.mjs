/** @jsxRuntime automatic */
/** @jsxImportSource @oai/artifact-tool/presentation-jsx */

import fs from "node:fs";
import path from "node:path";

const {
  Presentation,
  PresentationFile,
  row,
  column,
  grid,
  panel,
  text,
  rule,
  fill,
  hug,
  fixed,
  wrap,
  fr,
  auto,
} = await import("@oai/artifact-tool");

const SLIDE = { width: 1920, height: 1080 };
const palette = {
  sand: "#F6F0E4",
  paper: "#FFFDFC",
  ink: "#2B1E18",
  brown: "#6E4F3A",
  coral: "#E68158",
  navy: "#17354F",
  mist: "#E8EEF4",
  slate: "#52616E",
  line: "#DCCFBC",
  green: "#3D7A64",
};

const titleStyle = {
  fontFace: "Georgia",
  fontSize: 46,
  bold: true,
  color: palette.ink,
};

const titleStyleDark = {
  ...titleStyle,
  color: palette.paper,
  fontSize: 58,
};

const bodyStyle = {
  fontFace: "Aptos",
  fontSize: 24,
  color: palette.slate,
};

const bodyStyleDark = {
  ...bodyStyle,
  color: "#DCE7F2",
};

const kickerStyle = {
  fontFace: "Aptos",
  fontSize: 18,
  bold: true,
  color: palette.coral,
  characterSpacing: 2.2,
};

function setBackground(slide, color) {
  slide.background.fill = { type: "solid", color };
}

function slideFrame(slide, node) {
  slide.compose(node, {
    frame: { left: 0, top: 0, width: SLIDE.width, height: SLIDE.height },
    baseUnit: 8,
  });
}

function kicker(label) {
  return text(label.toUpperCase(), {
    width: hug,
    height: hug,
    style: kickerStyle,
    name: `kicker-${label.replace(/\s+/g, "-").toLowerCase()}`,
  });
}

function bulletBlock(lines, dark = false, name = "bullets") {
  return text(
    lines.map((line) => `• ${line}`).join("\n"),
    {
      name,
      width: fill,
      height: hug,
      style: {
        ...(dark ? bodyStyleDark : bodyStyle),
        fontSize: 26,
        paragraphSpacingAfterPt: 10,
      },
    },
  );
}

function infoCard(name, heading, lines, options = {}) {
  const {
    fillColor = palette.paper,
    headingColor = palette.ink,
    bodyColor = palette.slate,
  } = options;

  return panel(
    {
      name,
      width: fill,
      height: fill,
      padding: 24,
      borderRadius: 26,
      fill: fillColor,
      stroke: { color: palette.line, width: 1.5 },
    },
    column(
      { width: fill, height: fill, gap: 14 },
      [
        text(heading, {
          name: `${name}-heading`,
          width: fill,
          height: hug,
          style: {
            fontFace: "Georgia",
            fontSize: 26,
            bold: true,
            color: headingColor,
          },
        }),
        text(lines.join("\n"), {
          name: `${name}-body`,
          width: fill,
          height: hug,
          style: {
            fontFace: "Aptos",
            fontSize: 21,
            color: bodyColor,
            paragraphSpacingAfterPt: 8,
          },
        }),
      ],
    ),
  );
}

const presentation = Presentation.create({ slideSize: SLIDE });

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.navy);
  slideFrame(
    slide,
    grid(
      {
        name: "cover-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1), auto],
        columns: [fr(1)],
        padding: { x: 96, y: 88 },
      },
      [
        kicker("spring boot project defense"),
        column(
          { name: "cover-stack", width: fill, height: hug, gap: 28, alignSelf: "center" },
          [
            text("Campus Resourcely", {
              name: "cover-title",
              width: wrap(1100),
              height: hug,
              style: titleStyleDark,
            }),
            rule({ name: "cover-rule", width: fixed(220), stroke: palette.coral, weight: 5 }),
            text(
              "A campus equipment reservation platform with approval workflow, scheduling, notifications, and layered Spring Boot architecture.",
              {
                name: "cover-subtitle",
                width: wrap(1280),
                height: hug,
                style: { ...bodyStyleDark, fontSize: 30 },
              },
            ),
          ],
        ),
        text("Backend focus: controllers, services, repositories, JPA entities, validation, scheduling, and business rules.", {
          name: "cover-footer",
          width: wrap(1120),
          height: hug,
          style: { ...bodyStyleDark, fontSize: 18, color: "#BFD0DF" },
        }),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.sand);
  slideFrame(
    slide,
    grid(
      {
        name: "problem-root",
        width: fill,
        height: fill,
        columns: [fr(1.1), fr(0.9)],
        rows: [auto, fr(1)],
        columnGap: 40,
        rowGap: 28,
        padding: { x: 84, y: 76 },
      },
      [
        column(
          { name: "problem-title", width: fill, height: hug, gap: 16, columnSpan: 2 },
          [
            kicker("project idea"),
            text("Why this project exists", {
              name: "problem-heading",
              width: fill,
              height: hug,
              style: titleStyle,
            }),
            text("Universities share expensive resources, but manual borrowing creates stock confusion, late returns, and weak traceability.", {
              name: "problem-subtitle",
              width: wrap(1350),
              height: hug,
              style: { ...bodyStyle, fontSize: 28 },
            }),
          ],
        ),
        infoCard(
          "problem-card",
          "What the system solves",
          [
            "Students request cameras, projectors, and embedded kits through a dedicated portal.",
            "Admins review and approve requests instead of giving equipment immediately.",
            "The backend tracks stock, due dates, returns, and overdue cases.",
          ],
        ),
        infoCard(
          "value-card",
          "Why it is stronger than CRUD",
          [
            "Two roles: student and administrator.",
            "Reservation lifecycle with approval logic.",
            "Scheduled notifications before and after deadlines.",
            "Separation between API contract and persistence model.",
          ],
          { fillColor: palette.paper },
        ),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.paper);
  slideFrame(
    slide,
    grid(
      {
        name: "architecture-root",
        width: fill,
        height: fill,
        rows: [auto, auto, auto, auto],
        columns: [fr(1)],
        rowGap: 24,
        padding: { x: 84, y: 72 },
      },
      [
        kicker("system architecture"),
        text("Frontend and backend are fully separated", {
          name: "architecture-title",
          width: fill,
          height: hug,
          style: titleStyle,
        }),
        row(
          { name: "architecture-flow", width: fill, height: hug, gap: 26 },
          [
            infoCard("arch-frontend", "Frontend", [
              "React SPA",
              "Student and admin portals",
              "Calls REST endpoints",
            ], { fillColor: "#FDF8F3" }),
            infoCard("arch-backend", "Spring Boot API", [
              "Controllers expose JSON",
              "Services hold business rules",
              "Repositories use JPA and MySQL",
            ], { fillColor: palette.mist }),
            infoCard("arch-db", "Persistence and automation", [
              "XAMPP MySQL database",
              "Seed data at startup",
              "Scheduled return reminders",
            ], { fillColor: "#F7FBF8" }),
          ],
        ),
        column(
          { name: "architecture-bottom", width: fill, height: hug, gap: 16 },
          [
            rule({ name: "arch-rule", width: fill, stroke: palette.line, weight: 2 }),
            bulletBlock([
              "Spring Boot is used only as a REST backend, not as server-side MVC views.",
              "The frontend authenticates users and consumes JSON data through the API.",
              "This decoupled structure makes the backend reusable by any future Angular, React, or mobile client.",
            ], false, "architecture-bullets"),
          ],
        ),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.sand);
  slideFrame(
    slide,
    grid(
      {
        name: "packages-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1)],
        columns: [fr(1), fr(1), fr(1)],
        columnGap: 28,
        rowGap: 28,
        padding: { x: 84, y: 72 },
      },
      [
        column(
          { name: "package-title-stack", width: fill, height: hug, gap: 14, columnSpan: 3 },
          [
            kicker("spring boot structure"),
            text("Backend package map and responsibilities", {
              name: "package-title",
              width: fill,
              height: hug,
              style: titleStyle,
            }),
          ],
        ),
        infoCard("package-1", "Entry, config, and exceptions", [
          "CampusResourceHubBackendApplication",
          "AppProperties",
          "CorsConfig",
          "DataSeeder",
          "GlobalExceptionHandler",
        ]),
        infoCard("package-2", "API and contracts", [
          "controller/",
          "dto/request/",
          "dto/response/",
          "ResponseEntity return style",
          "@Valid for request validation",
        ], { fillColor: "#F6FBFF" }),
        infoCard("package-3", "Domain and data", [
          "entity/",
          "repository/",
          "service/",
          "JPA relationships",
          "Business rules and status transitions",
        ], { fillColor: "#FBF8F4" }),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.paper);
  slideFrame(
    slide,
    grid(
      {
        name: "entity-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1), auto],
        columns: [fr(1), fr(1), fr(1)],
        columnGap: 28,
        rowGap: 26,
        padding: { x: 84, y: 72 },
      },
      [
        column(
          { name: "entity-title-stack", width: fill, height: hug, gap: 14, columnSpan: 3 },
          [
            kicker("jpa domain model"),
            text("Entities and relationships", {
              name: "entity-title",
              width: fill,
              height: hug,
              style: titleStyle,
            }),
            text("The data model follows the real borrowing process instead of storing everything in a single flat table.", {
              name: "entity-subtitle",
              width: wrap(1280),
              height: hug,
              style: bodyStyle,
            }),
          ],
        ),
        infoCard("entity-student", "Student side", [
          "Student",
          "StudentProfile",
          "One-to-one relation",
          "Login fields stay in Student",
          "Personal details stay in StudentProfile",
        ]),
        infoCard("entity-resource", "Inventory side", [
          "Resource",
          "ResourceTag",
          "Many-to-many tag mapping",
          "Asset code uniqueness",
          "Quantity represents available stock",
        ], { fillColor: palette.mist }),
        infoCard("entity-flow", "Process side", [
          "Reservation",
          "Notification",
          "Reservation -> Student many-to-one",
          "Reservation -> Resource many-to-one",
          "Notification linked to both student and reservation",
        ], { fillColor: "#F7FBF8" }),
        text("This separation improves normalization, avoids repeated profile data, and makes the model easier to extend later.", {
          name: "entity-note",
          columnSpan: 3,
          width: fill,
          height: hug,
          style: { ...bodyStyle, fontSize: 22 },
        }),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.sand);
  slideFrame(
    slide,
    grid(
      {
        name: "request-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1)],
        columns: [fr(1.1), fr(0.9)],
        columnGap: 34,
        rowGap: 24,
        padding: { x: 84, y: 72 },
      },
      [
        column(
          { name: "request-title-stack", width: fill, height: hug, gap: 14, columnSpan: 2 },
          [
            kicker("request lifecycle"),
            text("How one API request moves through Spring Boot", {
              name: "request-title",
              width: fill,
              height: hug,
              style: titleStyle,
            }),
          ],
        ),
        column(
          { name: "request-left", width: fill, height: fill, gap: 20 },
          [
            infoCard("request-controller", "1. Controller", [
              "Receives HTTP request",
              "Uses @RequestMapping and @PostMapping",
              "Applies @Valid to DTO input",
            ]),
            infoCard("request-service", "2. Service", [
              "Checks business rules",
              "Finds student and resource",
              "Validates capacity and dates",
              "Creates or updates reservation state",
            ], { fillColor: palette.paper }),
          ],
        ),
        column(
          { name: "request-right", width: fill, height: fill, gap: 20 },
          [
            infoCard("request-repo", "3. Repository", [
              "Spring Data JPA repositories execute persistence operations",
              "Derived query methods avoid writing SQL for common lookups",
            ], { fillColor: palette.mist }),
            infoCard("request-response", "4. Response DTO", [
              "Entity is mapped to ReservationResponse",
              "Frontend receives only the fields it needs",
              "Validation and internal fields stay controlled",
            ], { fillColor: "#F8FBF7" }),
          ],
        ),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.paper);
  slideFrame(
    slide,
    grid(
      {
        name: "workflow-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1)],
        columns: [fr(1), fr(1), fr(1)],
        columnGap: 24,
        rowGap: 24,
        padding: { x: 84, y: 72 },
      },
      [
        column(
          { name: "workflow-title", width: fill, height: hug, gap: 14, columnSpan: 3 },
          [
            kicker("reservation logic"),
            text("This is the core business workflow", {
              name: "workflow-heading",
              width: fill,
              height: hug,
              style: titleStyle,
            }),
          ],
        ),
        infoCard("workflow-student", "Student request", [
          "Request starts as PENDING",
          "Student must reserve at least 2 days ahead",
          "Start and end dates must be weekdays",
          "Reservation cannot exceed 7 weekdays",
        ]),
        infoCard("workflow-admin", "Admin approval", [
          "Approve pending request",
          "APPROVED if start date is in the future",
          "ACTIVE if start date is today",
          "Stock is decremented only when active",
        ], { fillColor: palette.mist }),
        infoCard("workflow-return", "Return and overdue", [
          "RETURNED when admin confirms return",
          "OVERDUE when expected return date is passed",
          "REJECTED for unapproved requests that miss the start date",
        ], { fillColor: "#F7FBF8" }),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.sand);
  slideFrame(
    slide,
    grid(
      {
        name: "notification-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1)],
        columns: [fr(1), fr(1)],
        columnGap: 30,
        rowGap: 24,
        padding: { x: 84, y: 72 },
      },
      [
        column(
          { name: "notification-title", width: fill, height: hug, gap: 14, columnSpan: 2 },
          [
            kicker("automation and resilience"),
            text("Scheduling, validation, and exception handling", {
              name: "notification-heading",
              width: fill,
              height: hug,
              style: titleStyle,
            }),
          ],
        ),
        infoCard("scheduler-card", "NotificationService", [
          "@EnableScheduling activates the cron system.",
          "@Scheduled(cron = \"0 0 8 * * *\") sends due-soon reminders every morning.",
          "ApplicationReadyEvent also seeds reminders at startup for the demo.",
          "Admins can send manual overdue alerts to students.",
        ], { fillColor: "#F6FBFF" }),
        infoCard("exception-card", "Validation and errors", [
          "DTO annotations validate request data before business logic runs.",
          "BusinessException represents rule violations such as full booking or invalid dates.",
          "GlobalExceptionHandler converts errors into clean JSON responses with 400 or 404 status codes.",
        ], { fillColor: palette.paper }),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.paper);
  slideFrame(
    slide,
    grid(
      {
        name: "files-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1)],
        columns: [fr(1.05), fr(0.95)],
        columnGap: 30,
        rowGap: 24,
        padding: { x: 84, y: 72 },
      },
      [
        column(
          { name: "files-title", width: fill, height: hug, gap: 14, columnSpan: 2 },
          [
            kicker("important code files"),
            text("What to mention if the professor asks where the logic is", {
              name: "files-heading",
              width: fill,
              height: hug,
              style: titleStyle,
            }),
          ],
        ),
        bulletBlock([
          "CampusResourceHubBackendApplication.java: startup, property scanning, scheduling.",
          "ReservationService.java: main business logic for reservation creation, approval, status refresh, and stock rules.",
          "NotificationService.java: automatic reminders and manual overdue alerts.",
          "StudentService.java: student CRUD, login, and profile mapping.",
          "GlobalExceptionHandler.java: centralized API error responses.",
        ], false, "files-left"),
        bulletBlock([
          "ReservationController.java: exposes reservation endpoints.",
          "DataSeeder.java: prepares demo students, resources, and reservations.",
          "StudentReservationRequest.java and ReservationRequest.java: validation contracts.",
          "Reservation.java, Student.java, Resource.java: JPA entities and relationships.",
          "application.properties: ports, MySQL, JPA, and custom app properties.",
        ], false, "files-right"),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.sand);
  slideFrame(
    slide,
    grid(
      {
        name: "qa-root",
        width: fill,
        height: fill,
        rows: [auto, fr(1)],
        columns: [fr(1), fr(1)],
        columnGap: 28,
        rowGap: 24,
        padding: { x: 84, y: 72 },
      },
      [
        column(
          { name: "qa-title", width: fill, height: hug, gap: 14, columnSpan: 2 },
          [
            kicker("likely questions"),
            text("Short answers for the oral defense", {
              name: "qa-heading",
              width: fill,
              height: hug,
              style: titleStyle,
            }),
          ],
        ),
        infoCard("qa-left", "Common technical questions", [
          "Why Spring Boot? Because it provides auto-configuration, REST support, validation, JPA, and scheduling with less boilerplate.",
          "Why not put logic in controllers? Because services keep business rules reusable and testable.",
          "Why DTOs? To validate input and avoid exposing entities directly.",
        ]),
        infoCard("qa-right", "Honest project limits", [
          "The database is local XAMPP MySQL, so the demo depends on MySQL being started.",
          "Passwords are plain for demo scope, not production security.",
          "Authentication uses JWT and role-based access control in the Spring Boot backend.",
          "Frontend is React in this repository, while Spring Boot remains the academic focus.",
        ], { fillColor: palette.paper }),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  setBackground(slide, palette.navy);
  slideFrame(
    slide,
    column(
      {
        name: "closing-root",
        width: fill,
        height: fill,
        padding: { x: 96, y: 88 },
        gap: 24,
        justifyContent: "center",
      },
      [
        kicker("closing summary"),
        text("What this project demonstrates in Spring Boot", {
          name: "closing-title",
          width: wrap(1300),
          height: hug,
          style: titleStyleDark,
        }),
        bulletBlock([
          "Layered architecture: controller, service, repository, DTO, entity, exception.",
          "JPA entity relationships that reflect a real reservation domain.",
          "Business-rule implementation beyond CRUD.",
          "Validation, scheduling, notifications, and stock control.",
          "A backend designed to support a separated frontend through REST APIs.",
        ], true, "closing-bullets"),
      ],
    ),
  );
}

const outputPath = path.resolve("output", "output.pptx");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const pptxBlob = await PresentationFile.exportPptx(presentation);
await pptxBlob.save(outputPath);

console.log(outputPath);
