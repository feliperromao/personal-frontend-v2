import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
const paginationModel = { page: 0, pageSize: 5 };
const columns: GridColDef[] = [
  { field: 'name', headerName: 'Exercicio', minWidth: 300, cellClassName: "table-header" }
];
const SelectExercises: React.FC = () => {
  const rows = [
    { id: 1, name: 'Supino inclinado com alteres', },
    { id: 2, name: 'Supino reto com barra', },
    { id: 3, name: 'Agachamento libre', },
    { id: 4, name: 'Cadeira flexora',  },
    { id: 5, name: 'Mesa flexora',  },
    { id: 6, name: 'Cadeira extensora',  },
    { id: 7, name: 'Agachamento sumo',  },
    { id: 8, name: 'Levantamento terra', },
    { id: 9, name: 'Rosca direta', },
  ];

  return (
    <Paper sx={{ width: '100%'}}>
      <DataGrid
        density='compact'
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </Paper>
  )
}

export default SelectExercises;