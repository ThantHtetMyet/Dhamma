CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "UserRole" (
  "ID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "RoleName" varchar(100) NOT NULL,
  "Description" varchar(100) NOT NULL,
  "IsDeleted" boolean NOT NULL,
  "CreatedDate" timestamptz NULL,
  "UpdatedDate" timestamptz NULL,
  "CreatedBy" uuid NULL,
  "UpdatedBy" uuid NULL
);

CREATE TABLE IF NOT EXISTS "User" (
  "ID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "UserRoleID" uuid NOT NULL,
  "UserID" varchar(100) NOT NULL,
  "FullName" text NOT NULL,
  "Email" text NOT NULL,
  "MobileNo" text NOT NULL,
  "LoginPassword" varchar(100) NOT NULL,
  "LastLogin" timestamptz NOT NULL,
  "IsActive" boolean NOT NULL,
  "IsDeleted" boolean NOT NULL,
  "CreatedDate" timestamptz NOT NULL,
  "UpdatedDate" timestamptz NOT NULL,
  "CreatedBy" uuid NULL,
  "UpdatedBy" uuid NULL
);

CREATE TABLE IF NOT EXISTS "UserPermissions" (
  "ID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "UserRoleID" uuid NOT NULL,
  "ModuleName" varchar(100) NULL,
  "IsDeleted" boolean NOT NULL,
  "CanCreate" boolean NOT NULL,
  "CanRead" boolean NOT NULL,
  "CanUpdate" boolean NOT NULL,
  "CanDelete" boolean NOT NULL,
  "CreatedDate" timestamptz NULL,
  "UpdatedDate" timestamptz NULL,
  "CreatedBy" uuid NULL,
  "UpdatedBy" uuid NULL
);

ALTER TABLE "User"
  ADD CONSTRAINT "FK_User_UserRole"
  FOREIGN KEY ("UserRoleID")
  REFERENCES "UserRole" ("ID");

ALTER TABLE "User"
  ADD CONSTRAINT "FK_User_CreatedBy"
  FOREIGN KEY ("CreatedBy")
  REFERENCES "User" ("ID");

ALTER TABLE "User"
  ADD CONSTRAINT "FK_User_UpdatedBy"
  FOREIGN KEY ("UpdatedBy")
  REFERENCES "User" ("ID");

ALTER TABLE "UserRole"
  ADD CONSTRAINT "FK_UserRole_CreatedBy"
  FOREIGN KEY ("CreatedBy")
  REFERENCES "User" ("ID");

ALTER TABLE "UserRole"
  ADD CONSTRAINT "FK_UserRole_UpdatedBy"
  FOREIGN KEY ("UpdatedBy")
  REFERENCES "User" ("ID");

ALTER TABLE "UserPermissions"
  ADD CONSTRAINT "FK_UserPermissions_UserRole"
  FOREIGN KEY ("UserRoleID")
  REFERENCES "UserRole" ("ID");

ALTER TABLE "UserPermissions"
  ADD CONSTRAINT "FK_UserPermissions_CreatedBy"
  FOREIGN KEY ("CreatedBy")
  REFERENCES "User" ("ID");

ALTER TABLE "UserPermissions"
  ADD CONSTRAINT "FK_UserPermissions_UpdatedBy"
  FOREIGN KEY ("UpdatedBy")
  REFERENCES "User" ("ID");

CREATE TABLE IF NOT EXISTS "Activity" (
  "ID" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "UserID" uuid NOT NULL,
  "Name" text NOT NULL,
  "StartDate" timestamptz NOT NULL,
  "EndDate" timestamptz NOT NULL,
  "Remark" varchar(200) NULL,
  "IsDeleted" boolean NOT NULL DEFAULT false,
  "CreatedDate" timestamptz NOT NULL DEFAULT now(),
  "UpdatedDate" timestamptz NOT NULL DEFAULT now(),
  "CreatedBy" uuid NULL,
  "UpdatedBy" uuid NULL
);

ALTER TABLE "Activity"
  ADD CONSTRAINT "FK_Activity_User"
  FOREIGN KEY ("UserID")
  REFERENCES "User" ("ID");

ALTER TABLE "Activity"
  ADD CONSTRAINT "FK_Activity_CreatedBy"
  FOREIGN KEY ("CreatedBy")
  REFERENCES "User" ("ID");

ALTER TABLE "Activity"
  ADD CONSTRAINT "FK_Activity_UpdatedBy"
  FOREIGN KEY ("UpdatedBy")
  REFERENCES "User" ("ID");
