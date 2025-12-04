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

export const MoonIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/>
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M480-360q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42ZM192-432H60v-96h132v96Zm696 0h-132v-96h132v96ZM480-792v-132h96v132h-96Zm0 696v-132h96v132h-96Zm-268-656L298-738l76 76-84 84-76-76Zm568 568L738-298l84 84 76-76-84-84Zm76-268L738-480l76-76 84 84-76 76ZM298-738L224-814l84-84 76 76-84 84Z"/>
  </svg>
);

// Additional Professional Icons
export const CopyIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Z"/>
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M200-200h57l391-391-57-57-391 391v57Zm-40 40v-120l424-424q17-17 42-17t42 17l120 120q17 17 17 42t-17 42L384-120H160Zm604-604L560-760q-17-17-42-17t-42 17L288-548q-17 17-17 42t17 42l164 164q17 17 42 17t42-17l276-276q17-17 17-42t-17-42Z"/>
  </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
  </svg>
);

export const BookmarkIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z"/>
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-38-60-97-95t-111-35q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/>
  </svg>
);

export const VolumeIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M560-131v-82q90-26 145-115t55-199q0-110-55-199t-145-115v-82q124 28 202 125.5T880-480q0 127-78 224.5T560-131ZM440-384Zm0 281v-100q-58-18-99-68.5T280-480q0-62 41-112.5t99-68.5v-100q-100 28-166.5 109T200-480q0 96 66.5 177T440-104Z"/>
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="m370-80-16-128q-13-5-24-12t-23-18l-122 51-93-164 108-79q-2-7-2-15.5t2-15.5l-108-79 93-164 122 51q11-11 23-17.5t24-11.5l16-128h184l16 128q13 5 24 12t23 18l122-51 93 164-108 79q2 7 2 15.5t-2 15.5l108 79-93 164-122-51q-11 11-23 17.5t-24 11.5l-16 128H370Zm92-280q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Z"/>
  </svg>
);

export const ModelIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M80-280v-400h800v400H80Zm40-40h720v-320H120v320Zm0-360h800v-80H120v80Zm560 160h80v-80h-80v80Zm-160 0h80v-80h-80v80Zm-160 0h80v-80h-80v80Zm-160 0h80v-80h-80v80Z"/>
  </svg>
);

export const LinkIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80Zm80-160v-80h360v80H520Zm360-160H720v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H720v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280Z"/>
  </svg>
);

export const RobotIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M200-80q-33 0-56.5-23.5T120-160v-400q0-33 23.5-56.5T200-640h80v-80q0-50 35-85t85-35h240q50 0 85 35t35 85v80h80q33 0 56.5 23.5T880-560v400q0 33-23.5 56.5T800-80H200Zm80-480h400v-80H280v80Zm-60 400h520v-360H220v360Zm280-80q17 0 28.5-11.5T540-260q0-17-11.5-28.5T500-300q-17 0-28.5 11.5T460-260q0 17 11.5 28.5T500-220Zm-80-120h80v-80h-80v80Zm160 0h80v-80h-80v80ZM220-160h520-520Z"/>
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-340 450-470 310-280h-70l-60-80Z"/>
  </svg>
);