// Hàm giải mã JWT token để lấy thông tin bên trong (payload)
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch  {
    return null;
  }
};

// Hàm lấy Role từ token (Xử lý tên key role dài loằng ngoằng của .NET)
export const getUserRole = (token: string): string | null => {
  const decoded = parseJwt(token);
  if (!decoded) return null;

  // .NET Core Identity thường dùng key này cho Role
  const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  return decoded[roleKey] || decoded['role'] || null;
};

export const getUserName = (token: string): string => {
  const decoded = parseJwt(token);
  if (!decoded) return 'User';
  
  // Lấy tên (ClaimTypes.Name)
  const nameKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
  return decoded[nameKey] || decoded['unique_name'] || decoded['sub'] || 'User';
};