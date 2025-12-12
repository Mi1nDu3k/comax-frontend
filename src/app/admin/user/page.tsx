'use client';
import { useEffect, useState } from 'react';
import { userService } from '@/services/user.service';
import { User } from '@/types/user';
import { FaLock, FaUnlock, FaCrown, FaUserSlash, FaSearch } from 'react-icons/fa';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi tải danh sách user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBanToggle = async (user: User) => {
    if (!confirm(`Bạn có chắc muốn ${user.isBanned ? 'MỞ KHÓA' : 'KHÓA'} user này?`)) return;
    try {
      if (user.isBanned) await userService.unban(user.id);
      else await userService.ban(user.id);
      fetchUsers(); 
    } catch (error) {
      console.error("Lỗi cấm/mở khóa:", error);
      alert('Thao tác thất bại');
    }
  };

  const handleVipToggle = async (user: User) => {
    if (!confirm(`Xác nhận thay đổi trạng thái VIP cho ${user.username}?`)) return;
    try {
      if (user.isvip) await userService.downgradeVip(user.id);
      else await userService.upgradeVip(user.id);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi cập nhật VIP:", error);
      alert('Lỗi cập nhật VIP');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Thành viên</h1>
        <div className="relative">
            <input 
                type="text" 
                placeholder="Tìm user..." 
                className="border rounded-lg pl-10 pr-4 py-2 text-sm w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Tài khoản</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Vai trò</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? <tr><td colSpan={6} className="p-4 text-center">Đang tải...</td></tr> : 
             filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500">#{user.id}</td>
                <td className="p-4 font-medium">{user.username}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                
                <td className="p-4 text-center">
                    {/* SỬA LỖI: So sánh chuỗi trực tiếp */}
                    {user.roleName === 'Admin' ? (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Admin</span>
                    ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">Member</span>
                    )}
                </td>

                <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                        {user.isvip && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">VIP</span>}
                        {user.isBanned && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">BANNED</span>}
                        {!user.isvip && !user.isBanned && <span className="text-green-600 text-xs">Active</span>}
                    </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button 
                        onClick={() => handleVipToggle(user)}
                        className={`p-2 rounded hover:bg-gray-100 transition ${user.isvip ? 'text-gray-400' : 'text-yellow-500'}`}
                        title={user.isvip ? "Hủy VIP" : "Nâng VIP"}
                    >
                        {user.isvip ? <FaUserSlash /> : <FaCrown />}
                    </button>

                    {/* SỬA LỖI: So sánh chuỗi trực tiếp */}
                    {user.roleName !== 'Admin' && (
                        <button 
                            onClick={() => handleBanToggle(user)}
                            className={`p-2 rounded hover:bg-gray-100 transition ${user.isBanned ? 'text-green-500' : 'text-red-500'}`}
                            title={user.isBanned ? "Mở khóa" : "Khóa tài khoản"}
                        >
                            {user.isBanned ? <FaUnlock /> : <FaLock />}
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}