import React, { useState } from 'react';
import { Modal } from '../../../../shared/ui/Modal/Modal';
import { Input, Select, Textarea } from '../../../../shared/ui/Input/Input';
import { Button } from '../../../../shared/ui/Button/Button';
import { MockEndpoint } from '../../../../entities/mock-api/model/types';
import { useCreateApi } from '../model/useCreateApi';
import styles from './CreateApiModal.module.css';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => ({
  value: m,
  label: m,
}));

const STATUS_CODES = [
  { value: 200, label: '200 OK' },
  { value: 201, label: '201 Created' },
  { value: 204, label: '204 No Content' },
  { value: 400, label: '400 Bad Request' },
  { value: 401, label: '401 Unauthorized' },
  { value: 403, label: '403 Forbidden' },
  { value: 404, label: '404 Not Found' },
  { value: 409, label: '409 Conflict' },
  { value: 422, label: '422 Unprocessable' },
  { value: 500, label: '500 Server Error' },
];

interface Props {
  projectName: string;
  onClose: () => void;
  onCreated: (endpoint: MockEndpoint) => void;
}

export const CreateApiModal: React.FC<Props> = ({ projectName, onClose, onCreated }) => {
  const [path, setPath] = useState('/');
  const [method, setMethod] = useState('GET');
  const [statusCode, setStatusCode] = useState(200);
  const [responseJson, setResponseJson] = useState('{\n  \n}');

  const { create, loading, error } = useCreateApi(projectName, (endpoint) => {
    onCreated(endpoint);
    onClose();
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(path, method, statusCode, responseJson);
  };

  return (
    <Modal title="New Mock Endpoint" onClose={onClose}>
      <form className={styles.form} onSubmit={onSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.row}>
          <Input
            label="Path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/api/users"
            required
          />
          <Select
            label="Method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={HTTP_METHODS}
          />
        </div>
        <Select
          label="Status Code"
          value={statusCode}
          onChange={(e) => setStatusCode(Number(e.target.value))}
          options={STATUS_CODES}
        />
        <Textarea
          label="Response JSON"
          value={responseJson}
          onChange={(e) => setResponseJson(e.target.value)}
          placeholder='{ "key": "value" }'
          rows={6}
        />
        <Button type="submit" fullWidth loading={loading}>
          Create Endpoint
        </Button>
      </form>
    </Modal>
  );
};
