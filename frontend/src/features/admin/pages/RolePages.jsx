import React from 'react'
import UserManagementPage from './UserManagementPage'

export function LecturerManagementPage() {
  return <UserManagementPage fixedRole="LECTURER" pageTitle="Giảng viên" />
}

export function StudentManagementPage() {
  return <UserManagementPage fixedRole="STUDENT" pageTitle="Sinh viên" />
}