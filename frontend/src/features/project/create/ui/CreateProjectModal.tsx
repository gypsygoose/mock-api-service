import React, { useState } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Input } from '../../../../shared/ui/Input/Input';
import { Button } from '../../../../shared/ui/Button/Button';
import { Project } from '../../../../entities/project/model/types';
import { useCreateProject } from '../model/useCreateProject';
import styles from './CreateProjectModal.module.css';

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const { create, loading, error } = useCreateProject((project) => {
    onCreated(project);
    onClose();
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(name);
  };

  return (
    <Modal title="New Project" onClose={onClose}>
      <form className={styles.form} onSubmit={onSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <div>
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-api"
            required
            pattern="[a-zA-Z0-9]+"
          />
          <p className={styles.hint}>Only letters and numbers. Used in the mock URL.</p>
        </div>
        <Button type="submit" fullWidth loading={loading}>
          Create Project
        </Button>
      </form>
    </Modal>
  );
};
