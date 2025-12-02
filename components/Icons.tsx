import React from 'react';
import { IconProps } from '../types';

export const UserIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-32q0-34 17.5-62.5T224-304q55-27 109.5-41.5T480-360q58 0 113.5 14.5T736-304q29 15 46.5 43.5T800-192v32q0 33-23.5 56.5T720-80H240q-33 0-56.5-23.5T160-160Z"/>
  </svg>
);

export const BotIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M160-240q-33 0-56.5-23.5T80-320v-400q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v400q0 33-23.5 56.5T800-240h-80v160l-140-160H160Zm160-320q17 0 28.5-11.5T360-600q0-17-11.5-28.5T320-640q-17 0-28.5 11.5T280-600q0 17 11.5 28.5T320-560Zm320 0q17 0 28.5-11.5T680-600q0-17-11.5-28.5T640-640q-17 0-28.5 11.5T600-600q0 17 11.5 28.5T640-560Z"/>
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Z"/>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M360-120l-57-152-153-58 153-58 57-152 57 152 153 58-153 58-57 152Zm360-320L660-560l-60-20 60-20 60-120 60 120 60 20-60 20-60 120Z"/>
  </svg>
);

export const HistoryIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-38-60-97-95t-111-35q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/>
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
  </svg>
);
