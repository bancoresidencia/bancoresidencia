'use client';

import React from 'react';
import { CreateListModal, CreateListModalProps } from './CreateListModal';

export type CreateCadernoModalProps = CreateListModalProps;

export const CreateCadernoModal: React.FC<CreateCadernoModalProps> = (props) => {
  return <CreateListModal {...props} />;
};
