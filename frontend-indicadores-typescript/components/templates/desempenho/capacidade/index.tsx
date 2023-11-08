import React from "react";
import { Card, CardBody, Tooltip } from "@nextui-org/react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false
});


export type CapacityData = {
  novos: number;
  resolvidos: number;
  diferenca: number;
  diferencaCapacidade: number;
  porcentagemCapacidade: number;
  porcentagemSquad: number;
  porcentagemTime: number;
  porcentagemOwnerEmRelacaoEquipe: number;
};


export function CapacityIndicators({
  data,
}: {
  data: CapacityData | undefined;
}) {
  if (!data) {
    return <p>Nenhum dado disponível</p>;
  }

  // Exemplo de dados fictícios para os últimos meses
  const previousMonthsNovos = [80, 90, 100, 110, data.novos];
  const previousMonthsResolvidos = [70, 85, 95, 100, data.resolvidos];

  const spark1Series = [
    { data: [25, 66, 41, 59, 25, 44, 12, 36, 9, 21] }
  ];
  
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ["#008FFB", "#FF4560"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Fev", "Mar", "Abr", "Mai", "Jun"],
      labels: {
        style: {
          colors: "#a1a1a1",
          fontSize: "14px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Quantidade",
        style: {
          color: "#a1a1a1",
        },
      },
      labels: {
        style: {
          colors: "#a1a1a1",
          fontSize: "14px",
        },
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: function (val: number) {
          return val + " tickets";
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#66D9EF", "#FF6B6B"],
        shadeIntensity: 0.85,
        type: "vertical",
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [0, 100, 100, 100],
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      labels: {
        colors: "#a1a1a1",
      },
    },
  };

  // Estruturando os dados em colunas e valores
  const indicators = [
    { title: "NOVOS", value: data.novos },
    { title: "RESOLVIDOS", value: data.resolvidos },
    { title: "CAPACIDADE", value: data.diferencaCapacidade },
    { title: "% CAPACIDADE", value: `${data.porcentagemCapacidade}%` },
    { title: "% SQUAD", value: `${data.porcentagemSquad}%` },
    {
      title: "% SUPORTE",
      value: `${data.porcentagemOwnerEmRelacaoEquipe}%`,
    },
  ];

  return (
    <div className="flex flex-wrap justify-center items-center gap-5 w-full">
     {/* <ReactApexChart
        options={options}
        series={[
          { name: "Novos Tickets", data: previousMonthsNovos },
          { name: "Tickets Resolvidos", data: previousMonthsResolvidos },
        ]}
        type="bar"
        height={350}
      /> */}

      {indicators.map((indicator, index) => (
        <Tooltip
          key={index}
          content={`Tickets abertos no periodo selecionado`}
          placement="top"
          color="secondary"
        >
          <Card className="border-none bg-transparent shadow-md w-full md:w-auto">
            <CardBody className="text-center">
              <div className="text-3xl mb-2.5">{indicator.value}</div>
              <div className="text-lg text-gray-500">{indicator.title}</div>
            </CardBody>
          </Card>
        </Tooltip>
      ))}
    </div>
  );
}
