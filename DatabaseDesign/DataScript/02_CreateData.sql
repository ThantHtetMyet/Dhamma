    INSERT INTO "UserRole" ("RoleName", "Description", "IsDeleted", "CreatedDate", "UpdatedDate", "CreatedBy", "UpdatedBy")
    SELECT "RoleName", "Description", "IsDeleted", "CreatedDate", "UpdatedDate", "CreatedBy", "UpdatedBy"
    FROM (
    VALUES
        ('Admin', 'System administrator', false, now(), now(), NULL::uuid, NULL::uuid),
        ('user', 'Default user role', false, now(), now(), NULL::uuid, NULL::uuid)
    ) AS v("RoleName", "Description", "IsDeleted", "CreatedDate", "UpdatedDate", "CreatedBy", "UpdatedBy")
    WHERE NOT EXISTS (
    SELECT 1 FROM "UserRole" ur WHERE ur."RoleName" = v."RoleName"
    );

    INSERT INTO "UserPermissions" ("UserRoleID", "ModuleName", "IsDeleted", "CanCreate", "CanRead", "CanUpdate", "CanDelete", "CreatedDate", "UpdatedDate", "CreatedBy", "UpdatedBy")
    SELECT ur."ID", v."ModuleName", false, v."CanCreate", v."CanRead", v."CanUpdate", v."CanDelete", now(), now(), NULL::uuid, NULL::uuid
    FROM "UserRole" ur
    JOIN (
    VALUES
        ('Admin', 'User', true, true, true, true),
        ('user', 'User', false, true, false, false)
    ) AS v("RoleName", "ModuleName", "CanCreate", "CanRead", "CanUpdate", "CanDelete")
    ON ur."RoleName" = v."RoleName"
    WHERE NOT EXISTS (
    SELECT 1 FROM "UserPermissions" up
    WHERE up."UserRoleID" = ur."ID"
        AND (up."ModuleName" IS NOT DISTINCT FROM v."ModuleName")
    );

    UPDATE "UserPermissions" up
    SET
      "CanCreate" = CASE WHEN ur."RoleName" = 'Admin' THEN true ELSE false END,
      "CanRead" = true,
      "CanUpdate" = CASE WHEN ur."RoleName" = 'Admin' THEN true ELSE false END,
      "CanDelete" = CASE WHEN ur."RoleName" = 'Admin' THEN true ELSE false END,
      "ModuleName" = 'User',
      "UpdatedDate" = now(),
      "UpdatedBy" = NULL::uuid
    FROM "UserRole" ur
    WHERE up."UserRoleID" = ur."ID"
      AND up."IsDeleted" = false
      AND (up."ModuleName" IS NULL OR up."ModuleName" = 'User');

    INSERT INTO "User" (
    "UserRoleID",
    "FullName",
    "MobileNo",
    "HealthIssues",
    "Remark",
    "LoginPassword",
    "PatternLock",
    "LastLogin",
    "IsActive",
    "IsDeleted",
    "CreatedDate",
    "UpdatedDate",
    "CreatedBy",
    "UpdatedBy"
    )
    SELECT
    ur."ID",
    'Admin User',
    '83816401',
    ARRAY[]::text[],
    'System administrator account',
    'Willowglen@12345',
    '1459',
    now(),
    true,
    false,
    now(),
    now(),
    NULL,
    NULL
    FROM "UserRole" ur
    WHERE ur."RoleName" = 'Admin'
    AND NOT EXISTS (
        SELECT 1 FROM "User" u WHERE u."MobileNo" = '83816401'
    );

    UPDATE "User" u
    SET
      "PatternLock" = '1459',
      "UpdatedDate" = now(),
      "UpdatedBy" = NULL::uuid
    FROM "UserRole" ur
    WHERE u."UserRoleID" = ur."ID"
      AND ur."RoleName" = 'Admin'
      AND u."IsDeleted" = false
      AND (u."PatternLock" IS NULL OR btrim(u."PatternLock") = '' OR char_length(btrim(u."PatternLock")) <> 4);
