
// This file serves as a re-export to avoid circular dependencies
import React from 'react';
import { UserRoleManager as UserRoleManagerComponent } from './user-roles/UserRoleManager';

const UserRoleManager = () => {
  return <UserRoleManagerComponent />;
};

export default UserRoleManager;
