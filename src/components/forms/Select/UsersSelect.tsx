import React from 'react';
import SearchableSelect from '../SearchableSelect';
import axios from 'axios';
import { User } from '../../../domain/types';
import { handleOpenNotification, SNACKBAR_TYPES } from '../../MySnackbar';
const URL = `${process.env.REACT_APP_BACKEND_GRAPH_API}/students/list-all`
const token = localStorage.getItem('auth-token');

interface Option {
  label: string;
  value: string;
}

interface UsersSelectProps {
  value: Option | undefined
}

const UsersSelect: React.FC<UsersSelectProps> = ({ value }) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [users, setUsers] = React.useState<Option[]>([]);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersRaw = response.data.map((user: User) => ({ label: user.name, value: user.id }))
      setUsers(usersRaw);
    } catch (error) {
      handleOpenNotification("Falha ao listar alunos!", SNACKBAR_TYPES.error);
    }
  };

  return (
    <SearchableSelect
      options={users}
      value={value}
    />
  )
}

export default UsersSelect;