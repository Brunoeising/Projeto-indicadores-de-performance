import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Accordion,
  AccordionItem
} from "@nextui-org/react";

type Desempenho = {
  analista: string;
  squad: string;
  media: number;
  ticketsAbertos: number;
  ticketsResolvidos: number;
};

export default function Resultados() {
  const desempenhoData: Desempenho[] = [
    {
      analista: "John Doe",
      squad: "Squad A",
      media: 90,
      ticketsAbertos: 10,
      ticketsResolvidos: 8
    },
    {
      analista: "John Doe",
      squad: "Squad B",
      media: 85,
      ticketsAbertos: 12,
      ticketsResolvidos: 10
    }
  ];

  return (
      <Table removeWrapper isCompact isStriped>
                    <TableHeader>
                        <TableColumn>ANALISTA</TableColumn>
                        <TableColumn>MES</TableColumn>
                        <TableColumn>DATA FEEDBACK</TableColumn>
                        <TableColumn>MÉDIA</TableColumn>
                        <TableColumn>TOTAL</TableColumn>
                        {/* ... outras colunas ... */}
                    </TableHeader>
                    <TableBody>
                        {desempenhoData.map((record, index) => (
                            <TableRow key={index}>
                                <TableCell>{record.analista}</TableCell>
                                <TableCell>{record.squad}</TableCell>
                                <TableCell>{record.media}</TableCell>
                                <TableCell>{record.ticketsAbertos}</TableCell>
                                <TableCell>{record.ticketsResolvidos}</TableCell>
                          
                                {/* ... outras células ... */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
 
  );
}
