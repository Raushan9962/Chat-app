import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const onlineUsers = []; // You can replace this with actual logic later

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        <div className="border-b border-base-300 w-full p-5">
            <div className="flex items-center gap-2">
                <Users className="size-6" />
                <span className="font-medium hidden lg:block">Contacts</span>
            </div>
            {/*todo:online filter toggle */}
        </div>
        <div className="overflow-y-auto w-full py-3">
            {users.map((user) => (
                <button
                key={user._id}
                className={`w-full p-3 flex items-center gap-3 border-b border-base-300 cursor-pointer ${
                    selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
                }`}
                onClick={() => setSelectedUser(user)} 
                >
                <div className="relative mx-auto lg:mx-0">
                    <img
                    src={user.profilePic||"https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                    />
                   
                    <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                        onlineUsers.includes(user._id) ? "bg-green-500" : "bg-gray-400"
                    }`}
                    ></span>
                </div>
                {/*User info-only visible on Larger screens*/}

                <div className="hidden lg:block text-left min-w-0 flex-1">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">{onlineUsers.includes(user._id) ? "Online" : "Offline"}</div>
                </div>
                </button>
            ))}
        </div>
    </aside>
  )
};

export default Sidebar;
