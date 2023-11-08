import React from "react";
import { Card, CardBody, Tooltip } from "@nextui-org/react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export interface BacklogData {
    ongoing: number;
    superior30d: number;
    percentSuperior: string;
    percentSquad: string;
    percentTime: string;
}


const options: ApexCharts.ApexOptions = {
    chart: {
        type: "bar",
        height: 350,
        toolbar: {
            show: false,
        },
    },
    xaxis: {
        categories: ["Mês passado", "Este mês"],
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
};

export function BacklogMetrics({ data }: { data: BacklogData | undefined }) {
    if (!data) {
        return <p>Nenhum dado disponível</p>;
    }

    const chartData = [
        { name: "Tickets > 30 dias", data: [data.superior30d, data.superior30d] }
    ];

    const indicators = [
        { title: "ANDAMENTO", value: data.ongoing },
        { title: "+30 DIAS", value: data.superior30d },
        { title: "% +30 DIAS", value: `${!isNaN(Number(data.percentSuperior)) ? Number(data.percentSuperior).toFixed(2) : '0.00'}%` },
        { title: "% SQUAD", value: `${!isNaN(Number(data.percentSquad)) ? Number(data.percentSquad).toFixed(2) : '0.00'}%` },
        { title: "% SUPORTE", value: `${!isNaN(Number(data.percentTime)) ? Number(data.percentTime).toFixed(2) : '0.00'}%` },        
    ];

    return (
        <div className="flex flex-wrap justify-center items-center gap-5 w-full">
          {/*     <ReactApexChart
                options={options}
                series={chartData}
                type="bar"
                height={350}
            />*/}
            {indicators.map((indicator, index) => (
                <Tooltip 
                    key={index}
                    content={`Mais informações sobre ${indicator.title}`} 
                    placement="top" 
                    color="secondary"
                >
                    <Card
                        className="border-none bg-transparent shadow-md w-full md:w-auto"
                    >
                        <CardBody className="text-center">
                            <div className="text-3xl mb-2.5">
                                {indicator.value}
                            </div>
                            <div className="text-lg text-gray-500">
                                {indicator.title}
                            </div>
                        </CardBody>
                    </Card>
                </Tooltip>
            ))}
        </div>
    );
}
