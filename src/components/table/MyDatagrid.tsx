import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import ItemsMenu from "./ItemsMenu";
import { paginationModel } from "../../pages/@shared/pagination";

interface DatagridProps {
  rows: any[],
  totalDocuments: number
  columns: GridColDef[],
  showOptions: boolean,
  setSelected: (ids: GridRowSelectionModel) => void,
  changePagination: () => void,
  handleDelete: () => void,
  handleEdit: (id: string) => void,
}

const Table: React.FC<DatagridProps> = ({ rows, columns, totalDocuments, showOptions, setSelected, changePagination, handleDelete, handleEdit }) => {
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

export default Table;