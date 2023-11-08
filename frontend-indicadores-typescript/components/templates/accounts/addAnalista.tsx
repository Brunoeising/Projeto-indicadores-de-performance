import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Dropdown,
  DropdownItem,
} from "@nextui-org/react";
import { EyeSlashFilledIcon } from "@/components/icons/EyeSlashFilledIcon";
import { EyeFilledIcon } from "@/components/icons/EyeFilledIcon";
import AlertModal from "@/components/modal";

type AnalistaRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddAnalista: () => void; // Adicionando esta linha
};


export default function AnalistaRegistrationModal({
  isOpen,
  onClose,
  onAddAnalista
}: AnalistaRegistrationModalProps) {
  const [analista, setAnalista] = useState({
    email: "",
    password: "",
    name: "",
    celular: "",
    imagem: "",
    codigoMovidesk: "",
    perfil: "padrão",
    peopleId: "",
  });
  const resetAnalistaState = () => {
    setAnalista({
      email: "",
      password: "",
      name: "",
      celular: "",
      imagem: "",
      codigoMovidesk: "",
      perfil: "padrão",
      peopleId: "",
    });
  };

  const [alertMessage, setAlertMessage] = useState<string | null>(null); // Estado para a mensagem do AlertModal

  const handleCloseModal = () => {
    setAlertMessage(null);
    resetAnalistaState(); // Resetando o estado do analista aqui
    onClose();
  };

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setAnalista((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDropdownChange = (value: { toString: () => any }) => {
    setAnalista((prevState) => ({
      ...prevState,
      perfil: value.toString(),
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "https://indicators-backend.vercel.app/api/analista/analistas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(analista),
        }
      );

      if (response.ok) {
        console.log("Definindo mensagem de sucesso");
        setAlertMessage("Analista adicionado com sucesso!");
        onAddAnalista(); // Atualiza a lista de analistas no componente pai
      }

      console.log("Definindo mensagem de sucesso");
      setAlertMessage("Analista adicionado com sucesso!");
    } catch (error) {
      console.log("Definindo mensagem de erro");
      setAlertMessage(
        "Erro ao adicionar o analista. Por favor, tente novamente."
      );
    }
  };

  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const validateEmail = (value: string) =>
    value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  //falta preencher um valor para validação abaixo.
  const isInvalid = "" === "" ? false : !validateEmail(analista.email);

  return (
    <>
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={() => {
          resetAnalistaState();
          onClose();
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          },
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cadastro de Analista
              </ModalHeader>
              <ModalBody>
                <Input
                  value={analista.email}
                  type="email"
                  label="Email"
                  size="sm"
                  placeholder="bruno@lindao.org"
                  variant="bordered"
                  isInvalid={isInvalid}
                  color={isInvalid ? "danger" : "default"}
                  errorMessage={isInvalid && "Digite um e-mail valido"}
                  onValueChange={(value) =>
                    handleInputChange({ target: { name: "email", value } })
                  }
                  className="max-w-none"
                />{" "}
                <Input
                  label="Senha"
                  size="sm"
                  variant="bordered"
                  placeholder="Digite sua senha"
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  type={isVisible ? "text" : "password"}
                  value={analista.password}
                  onValueChange={(value) =>
                    handleInputChange({ target: { name: "password", value } })
                  }
                  className="max-w-none"
                />
                <Input
                  value={analista.name}
                  type="name"
                  label="Nome"
                  variant="bordered"
                  size="sm"
                  placeholder="Nome completo."
                  onValueChange={(value) =>
                    handleInputChange({ target: { name: "name", value } })
                  }
                  className="max-w-none"
                />
                <Input
                  value={analista.celular}
                  type="number"
                  label="Celular"
                  variant="bordered"
                  size="sm"
                  placeholder="Telefone de contato."
                  onValueChange={(value) =>
                    handleInputChange({ target: { name: "celular", value } })
                  }
                  className="max-w-none"
                />
                <Input
                  value={analista.imagem}
                  label="Imagem"
                  size="sm"
                  variant="bordered"
                  placeholder="URL imagem."
                  onValueChange={(value) =>
                    handleInputChange({ target: { name: "imagem", value } })
                  }
                  className="max-w-none"
                />
                <Input
                  value={analista.codigoMovidesk}
                  type="number"
                  label="Código Movidesk"
                  variant="bordered"
                  placeholder="Código do analista na movidesk."
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "codigoMovidesk", value },
                    })
                  }
                  className="max-w-none"
                />
                <Input
                  value={analista.peopleId}
                  type="number"
                  label="Person ID"
                  size="sm"
                  variant="bordered"
                  placeholder="."
                  onValueChange={(value) =>
                    handleInputChange({ target: { name: "peopleId", value } })
                  }
                  className="max-w-none"
                />
                <AlertModal
                  isOpen={!!alertMessage}
                  onClose={handleCloseModal}
                  message={alertMessage || ""}
                />
                <Dropdown placeholder="Perfil" onChange={handleDropdownChange}>
                  <DropdownItem value="administrador">
                    Administrador
                  </DropdownItem>
                  <DropdownItem value="padrão">Padrão</DropdownItem>
                </Dropdown>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Fechar
                </Button>
                <Button color="secondary" onPress={handleSubmit}>
                  Cadastrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
