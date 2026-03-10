import { supabase } from "./supabase";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";

async function parseResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return data;
}

async function request(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  const data = await parseResponse(res);
  if (!res.ok) {
    const message = data && data.message ? data.message : `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export async function requestRaw(path, payload) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(res);
  return { res, data };
}

export async function signIn({ email, password }) {
  const data = await request("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data;
}

export async function signUp({ name, email, password }) {
  const data = await request("/auth/sign-up", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return data;
}

export async function requestPasswordReset({ email }) {
  const data = await request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return data;
}

export async function loginRaw(credentials) {
  const response = (ok, status) => ({ ok, status });
  const mobileNo = credentials.mobileNo?.trim();
  const password = credentials.password || "";

  const { data, error } = await supabase
    .from("User")
    .select("ID, FullName, MobileNo, HealthIssues, Remark, LoginPassword, IsActive, UserRoleID, UserRole:UserRole!FK_User_UserRole(RoleName)")
    .eq("MobileNo", mobileNo)
    .limit(1);

  if (error) {
    return { res: response(false, 500), data: { error: error.message } };
  }

  if (!data || !data.length) {
    return { res: response(false, 404), data: { error: "Mobile number does not exist." } };
  }

  const user = data[0];
  if (!user.IsActive) {
    return { res: response(false, 403), data: { error: "Account is inactive." } };
  }
  if (user.LoginPassword !== password) {
    return { res: response(false, 401), data: { error: "Password wrong." } };
  }

  const now = new Date().toISOString();
  const { LoginPassword, ...safeUser } = user;
  await supabase.from("User").update({ LastLogin: now, UpdatedDate: now }).eq("ID", user.ID);

  return { res: response(true, 200), data: { user: safeUser } };
}

export async function signupRaw(userData) {
  const now = new Date().toISOString();
  const payload = {
    fullName: userData.fullName?.trim(),
    mobileNo: userData.mobileNo?.trim(),
    healthIssues: Array.isArray(userData.healthIssues) ? userData.healthIssues : [],
    remark: userData.remark?.trim() || "",
  };

  const response = (ok, status) => ({ ok, status });

  const { data: existing, error: existingError } = await supabase
    .from("User")
    .select("MobileNo")
    .eq("MobileNo", payload.mobileNo);

  if (existingError) {
    return { res: response(false, 500), data: { error: existingError.message } };
  }

  if (existing && existing.length) {
    return { res: response(false, 409), data: { message: "Mobile No already exists." } };
  }

  let roleId;
  const { data: roleData, error: roleError } = await supabase
    .from("UserRole")
    .select("ID, RoleName")
    .in("RoleName", ["user", "Normal"])
    .eq("IsDeleted", false)
    .order("RoleName");

  if (roleError) {
    return { res: response(false, 500), data: { error: roleError.message } };
  }

  if (roleData && roleData.length) {
    const preferredRole =
      roleData.find((role) => role.RoleName?.toLowerCase() === "user") ||
      roleData.find((role) => role.RoleName?.toLowerCase() === "normal");
    roleId = preferredRole?.ID;
  } else {
    const { data: newRole, error: newRoleError } = await supabase
      .from("UserRole")
      .insert({
        RoleName: "user",
        Description: "Default user role",
        IsDeleted: false,
        CreatedDate: now,
        UpdatedDate: now,
      })
      .select("ID")
      .single();

    if (newRoleError) {
      return { res: response(false, 500), data: { error: newRoleError.message } };
    }
    roleId = newRole?.ID;
  }

  if (!roleId) {
    return { res: response(false, 500), data: { error: 'Default role "user" was not found.' } };
  }

  const { data, error } = await supabase
    .from("User")
    .insert({
      UserRoleID: roleId,
      FullName: payload.fullName,
      MobileNo: payload.mobileNo,
      HealthIssues: payload.healthIssues,
      Remark: payload.remark || null,
      LoginPassword: "P@ssw0rd",
      LastLogin: now,
      IsActive: true,
      IsDeleted: false,
      CreatedDate: now,
      UpdatedDate: now,
      CreatedBy: null,
      UpdatedBy: null,
      PatternLock: null,
    })
    .select()
    .single();

  if (error) {
    return { res: response(false, 500), data: { error: error.message } };
  }

  return { res: response(true, 201), data };
}

export async function resetPasswordRaw(payload) {
  return requestRaw("/reset-password", payload);
}

export function saveToken(token) {
  try {
    localStorage.setItem("auth_token", token);
  } catch {}
}

export function getToken() {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("auth_token");
  } catch {}
}
