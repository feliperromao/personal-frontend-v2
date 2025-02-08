import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import ItemsMenu from "./ItemsMenu";

const paginationModel = { page: 0, pageSize: 10 };

interface DatagridProps {
  rows: any[],
  totalDocuments: number
  columns: GridColDef[],
  showOptions: boolean,
  setSelected: (ids: GridRowSelectionModel) => {},
  changePagination: () => {},
  handleDelete: () => {},
  handleEdit: (id: string) => {},
}

const MyDatagrid: React.FC<DatagridProps> = ({ rows, columns, totalDocuments, showOptions, setSelected, changePagination, handleDelete, handleEdit }) => {
  const onEditClick = (id: GridRowId): void => {
    handleEdit(id.toString())
  };

  if (showOptions) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Opções',
      width: 100,
      getActions: ({ id }) => {
        return [
          <ItemsMenu rowId={id} handleDelete={handleDelete} handleEdit={() => onEditClick(id)} />
        ];
      },
    })
  }

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{ pagination: { paginationModel } }}
      onRowSelectionModelChange={setSelected}
      checkboxSelection
      disableColumnSelector
      sx={{ border: 0 }}
      onPaginationModelChange={changePagination}
      paginationMode="server"
      rowCount={totalDocuments}
    />
  )
}

export default MyDatagrid;