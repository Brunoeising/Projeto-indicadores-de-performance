import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import React, { useState } from "react";
import { AcmeIcon } from "../icons/acme-icon";
import { AcmeLogo } from "../icons/acmelogo";
import { BottomIcon } from "../icons/sidebar/bottom-icon";

interface Company {
  name: string;
  location: string;
  logo: React.ReactNode;
}

export const CompaniesDropdown = () => {
  const [company, setCompany] = useState<Company>({
    name: "Suporte",
    location: "Suporte Empresas",
    logo: <AcmeIcon />,
  });
  return (
    <Dropdown
      classNames={{
        base: "w-full min-w-[260px]",
      }}
    >
      <DropdownTrigger className="cursor-pointer">
        <div className="flex items-center gap-2">
          {company.logo}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-medium m-0 text-default-900 -mb-4 whitespace-nowrap">
              {company.name}
            </h3>
            <span className="text-xs font-medium text-default-500">
              {company.location}
            </span>
          </div>
          <BottomIcon />
        </div>
      </DropdownTrigger>
      <DropdownMenu
        onAction={(e) => {
          if (e === "1") {
            setCompany({
              name: "Consultivo",
              location: "San Fransico, CA",
              logo: <AcmeIcon />,
            });
          }
          if (e === "2") {
            setCompany({
              name: "Contencioso",
              location: "Austin, Tx",
              logo: <AcmeLogo />,
            });
          }
          if (e === "3") {
            setCompany({
              name: "Tech",
              location: "Brooklyn, NY",
              logo: <AcmeIcon />,
            });
          }
          if (e === "4") {
            setCompany({
              name: "SLA Solução",
              location: "Suporte Projuris",
              logo: <AcmeIcon />,
            });
          }
        if (e === "5") {
          setCompany({
            name: "Suporte",
            location: "Suporte Projuris",
            logo: <AcmeIcon />,
          });
        }
        }}
        aria-label="Avatar Actions"
      >
        <DropdownSection title="Squads">
          <DropdownItem
            key="1"
            startContent={<AcmeIcon />}
            description="Consultivo"
            classNames={{
              base: "py-4",
              title: "text-base font-semibold",
            }}
          >
            Consultivo
          </DropdownItem>
          <DropdownItem
            key="2"
            startContent={<AcmeLogo />}
            description="Contencioso"
            classNames={{
              base: "py-4",
              title: "text-base font-semibold",
            }}
          >
            Contencioso
          </DropdownItem>
          <DropdownItem
            key="3"
            startContent={<AcmeIcon />}
            description="Tecnologia"
            classNames={{
              base: "py-4",
              title: "text-base font-semibold",
            }}
          >
            Tecnologia
          </DropdownItem>
          <DropdownItem
            key="4"
            startContent={<AcmeIcon />}
            description="SLA"
            classNames={{
              base: "py-4",
              title: "text-base font-semibold",
            }}
          >
            SLA de solução
            
          </DropdownItem>
          <DropdownItem
            key="5"
            startContent={<AcmeIcon />}
            description="Suporte"
            classNames={{
              base: "py-4",
              title: "text-base font-semibold",
            }}
          >
            Suporte
            
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
