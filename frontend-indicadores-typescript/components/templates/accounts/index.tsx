import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  ButtonGroup,
  User,
  Pagination,
  Spinner,
  Chip,
  Link,
  Tooltip,
  ChipProps,
  Input,
  Spacer,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  SortDescriptor,
  Divider,
  useDisclosure,
} from "@nextui-org/react";
import { columns, statusOptions } from "./data";
import { capitalize, deleteUserById, fetchAllUsers } from "./utils";
import DefaultLayout from "@/layouts/default";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { SearchIcon } from "@/components/icons/icons";
import { useAsyncList } from "@react-stately/data";
import { PlusIcon } from "@/components/icons/sidebar/PlusIcon";
import { ChevronDownIcon } from "@/components/icons/accounts/ChevronDownIcon";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import AnalistaRegistrationModal from "@/components/templates/accounts/addAnalista";
import CapacityModal from "./addCapacity";

type Analista = {
  _id: number;
  name: string;
  email: string;
  celular?: string;
  perfil: string;
  imagem?: string;
  codigoMovidesk?: string;
  // outros campos conforme necessário
};

const INITIAL_VISIBLE_COLUMNS = ["name", "email", "perfil", "ações"];

const AnalistasList = () => {
  const [filterValue, setFilterValue] = React.useState("");
  const [page, setPage] = React.useState(1);
  const hasSearchFilter = Boolean(filterValue);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [analista, setAnalista] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [capacidadeMinima, setCapacidadeMinima] = useState<number | null>(null);
  const [capacidadeMaxima, setCapacidadeMaxima] = useState<number | null>(null);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [rowsPerPage, setRowsPerPage] = useState(10); // Se você já tem um estado para isso, use-o
  const [visibleColumns, setVisibleColumns] = useState<Set<string> | "all">(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const analistasList = useAsyncList<Analista>({
    async load({ signal }) {
      const response = await fetchAllUsers({
        page: page,
        filter: filterValue,
        rowsPerPage,
        signal,
      });
      console.log("Resposta da API:", response); // Verifique os dados aqui
      return {
        items: response, // Se a resposta for um array diretamente
      };
    },
  });

  const reloadList = () => {
    analistasList.reload();
  };

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const filteredItems = React.useMemo(() => {
    let filteredData = [...analistasList.items];

    if (hasSearchFilter) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredData;
  }, [analistasList.items, filterValue]);

  const totalItens = filteredItems.length; // Armazenar o total de itens em uma variável
  const pages = Math.ceil(totalItens / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Analista, b: Analista) => {
      const first = a[sortDescriptor.column as keyof Analista] as number;
      const second = b[sortDescriptor.column as keyof Analista] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const {
    isOpen: isCapacityModalOpen,
    onOpen: onOpenCapacityModal,
    onClose: onCloseCapacityModal,
  } = useDisclosure();

  const handleEditItem = (item: Analista) => {
    // ... lógica de edição ...
  };

  const handleDeleteItem = async (id: any) => {
    try {
      await deleteUserById(id);
      // Atualize o estado ou faça algo após a exclusão
    } catch (error) {
      console.error("Erro ao deletar analista:", error);
    }
  };

  const renderCell = React.useCallback((item: Analista, columnKey: any) => {
    const cellValue = item[columnKey as keyof Analista];

    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{cellValue}</p>
          </div>
        );
      case "sigla":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{cellValue}</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "ações":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip color="secondary" content="Editar">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => handleEditItem(item)}
              >
                <EditIcon fill="#3F3F46" width={24} height={24} />
              </span>
            </Tooltip>
            <Tooltip color="secondary" content="Deletar">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDeleteItem(item._id)} // Adicione esta linha
              >
                <DeleteIcon fill="#610726" width={24} height={24} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <>
        <div className="flex flex-col gap-4 ml-1 mr-1">
          <ul className="flex">
            <li className="flex gap-2">
              <HouseIcon />
              <Link color="foreground" href={"/"}>
                <span>Início</span>
              </Link>
              <span> / </span>
            </li>
            <li className="flex  gap-2">
              <UsersIcon /> <span>Analistas</span>
            </li>
          </ul>
          <h3 className="text-justify font-semibold">Consultar analistas</h3>
          <p className="text-small text-default-400">
            Gestão dos analistas ativos na Movidesk
          </p>
        </div>
        <Spacer y={2} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap md:flex-nowrap justify-between gap-3 items-end">
            <Input
              isClearable
              classNames={{
                base: "w-full ",
                inputWrapper: "border-1",
              }}
              size="md"
              variant="bordered"
              placeholder="Buscar analistas..."
              startContent={<SearchIcon />}
              value={filterValue}
              onClear={() => setFilterValue("")}
              onValueChange={onSearchChange}
            />
            <div className="flex gap-3">
              <Dropdown backdrop="blur">
                <DropdownTrigger className="hidden sm:flex">
                  <Button
                    endContent={<ChevronDownIcon className="text-small" />}
                    size="md"
                    variant="shadow"
                    color="default"
                  >
                    Colunas
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={visibleColumns}
                  selectionMode="multiple"
                  onSelectionChange={(selected) => {
                    setVisibleColumns(new Set(selected as unknown as string[]));
                  }}
                >
                  {columns.map((column) => (
                    <DropdownItem
                      key={column.uid}
                      value={column.uid}
                      className="capitalize"
                    >
                      {capitalize(column.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Button
                className=" bg-gradient-to-r from-purple-950 to-purple-800 text-white hover:from-purple-600 hover:to-purple-800  transition-shadow shadow-lg hover:shadow-lg  hover:-translate-y-1  bg-background/30 "
                variant="shadow"
                size="md"
                onClick={onOpenCapacityModal}
               
              >
                Definir Capacidade
              </Button>

              <Button
                className=" bg-gradient-to-r from-purple-950 to-purple-800 text-white hover:from-purple-600 hover:to-purple-800  transition-shadow shadow-lg hover:shadow-lg  hover:-translate-y-1  bg-background/30 "
                variant="shadow"
                size="md"
                onPress={onOpen}
              >
                Novo analista
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-default-400 text-small">
              Total {totalItens} analistas
            </span>
            <label className="flex items-center text-default-400 text-small">
              Resultados por página:
              <select
                className="bg-transparent outline-none text-default-400 text-small"
                onChange={onRowsPerPageChange}
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </label>
          </div>
        </div>
      </>
    );
  }, [
    filterValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    hasSearchFilter,
    items,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <>
        <div className="py-2 px-2 flex justify-center items-center">
          <Pagination
            showControls
            showShadow
            variant="bordered"
            color="secondary"
            isDisabled={hasSearchFilter}
            page={page}
            total={pages}
            onChange={setPage} // Use 'setPage' function here for pagination
          />
        </div>
      </>
    );
  }, [selectedKeys, totalItens, pages, hasSearchFilter, page]);

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4 px-4 md:px-8 lg:px-4 max-w-none mx-auto">
        <CapacityModal
      isOpen={isCapacityModalOpen}
      onClose={onCloseCapacityModal}
          analista={analista}
          startDate={startDate}
          endDate={endDate}
          capacidadeMinima={capacidadeMinima}
          capacidadeMaxima={capacidadeMaxima}
          setAnalista={setAnalista}
          setMes={setStartDate} // <- Isso parece um erro. Você quis dizer `setMes`?
          setAno={setEndDate} // <- Isso parece um erro. Você quis dizer `setAno`?
          setCapacidadeMinima={setCapacidadeMinima}
          setCapacidadeMaxima={setCapacidadeMaxima}
        />
        <AnalistaRegistrationModal
          isOpen={isOpen}
          onClose={onClose}
          onAddAnalista={reloadList} // Adiciona esta linha
        />
        <Table
          topContent={topContent}
          bottomContent={bottomContent}
          selectedKeys={selectedKeys}
          sortDescriptor={sortDescriptor}
          aria-label="Table or users"
          removeWrapper
          isHeaderSticky
          bottomContentPlacement="outside"
          classNames={{
            wrapper: "max-h-[382px]",
            th: [
              "bg-transparent",
              "text-default-500",
              "border-b",
              "border-divider",
            ],
            td: ["group-data-[first=true]:first:before:rounded-none"],
          }}
          color="secondary"
          topContentPlacement="outside"
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            isLoading={isLoading && !items.length}
            emptyContent={"Nenhuma fonte encontrada"}
            items={sortedItems}
            loadingContent={<Spinner color="secondary" />}
          >
            {(item) => (
              <TableRow key={item._id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DefaultLayout>
  );
};

export default AnalistasList;
