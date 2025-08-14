import React from 'react';

const Sidebar = ({ users, onSelectUser, onLogout }) => {
  return (
    <div className="sidebar">
      <h3>Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user._id} onClick={() => onSelectUser(user)}>
            {user.fullName}
          </li>
        ))}
      </ul>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Sidebar;